import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import type { ToolWithCategory } from '@/types/database'

type Node = { x: number; y: number; vx: number; vy: number }

const MIN_NODES = 12
const MAX_NODES = 18

/**
 * Elemen signature hub: jaringan tool sebagai konstelasi titik yang saling
 * terhubung dan bergeser pelan mengikuti pointer. Satu-satunya momen "berani"
 * di seluruh app (CLAUDE.md §0 & §4) — sisanya tetap tenang.
 *
 * Hanya `transform` dan `opacity` yang berubah, jumlah titik dibatasi, dan
 * animasi berhenti total saat `prefers-reduced-motion` aktif.
 */
export function HeroConstellation({ tools }: { tools: ToolWithCategory[] }) {
  const reduced = useReducedMotion()
  const svgRef = useRef<SVGSVGElement>(null)
  const nodesRef = useRef<Node[]>([])
  const pointerRef = useRef({ x: 0.5, y: 0.5 })
  // Digambar dalam koordinat piksel: titik tetap bulat berapa pun rasio kotaknya.
  const [box, setBox] = useState({ w: 900, h: 220 })

  // Warna titik mengikuti accent tool yang benar-benar ada di katalog.
  const accents = tools.slice(0, MAX_NODES).map((tool) => `rgb(var(--accent-${tool.accent}))`)
  const accentKey = accents.join('|')
  const count = Math.min(Math.max(tools.length * 2, MIN_NODES), MAX_NODES)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setBox({ w: Math.round(width), h: Math.round(height) })
    })
    observer.observe(svg)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    // Sebaran deterministik (golden angle), bukan acak, agar stabil antar-render.
    nodesRef.current = Array.from({ length: count }, (_, index) => {
      const angle = index * 2.399963
      const spread = Math.sqrt((index + 0.5) / count)
      return {
        x: 0.5 + Math.cos(angle) * spread * 0.44,
        y: 0.5 + Math.sin(angle) * spread * 0.36,
        vx: Math.cos(angle * 1.7) * 0.00016,
        vy: Math.sin(angle * 2.3) * 0.00012,
      }
    })

    const dots = svg.querySelectorAll<SVGCircleElement>('[data-node]')
    const links = svg.querySelectorAll<SVGLineElement>('[data-link]')
    const linkDistance = box.w * 0.24

    const paint = () => {
      const { x: px, y: py } = pointerRef.current
      const points = nodesRef.current.map((node, index) => {
        const parallax = index % 3 === 0 ? 0.024 : 0.012
        return {
          x: (node.x + (px - 0.5) * parallax) * box.w,
          y: (node.y + (py - 0.5) * parallax) * box.h,
        }
      })

      points.forEach((point, index) => {
        dots[index]?.setAttribute('transform', `translate(${point.x} ${point.y})`)
      })

      let linkIndex = 0
      for (let i = 0; i < points.length && linkIndex < links.length; i += 1) {
        for (let j = i + 1; j < points.length && linkIndex < links.length; j += 1) {
          const link = links[linkIndex]
          linkIndex += 1
          const distance = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y)
          if (distance > linkDistance) {
            link.setAttribute('opacity', '0')
            continue
          }
          link.setAttribute('x1', String(points[i].x))
          link.setAttribute('y1', String(points[i].y))
          link.setAttribute('x2', String(points[j].x))
          link.setAttribute('y2', String(points[j].y))
          link.setAttribute('opacity', String(0.4 * (1 - distance / linkDistance)))
        }
      }
    }

    paint()
    if (reduced) return

    let frame = requestAnimationFrame(function step() {
      for (const node of nodesRef.current) {
        node.x += node.vx
        node.y += node.vy
        if (node.x < 0.06 || node.x > 0.94) node.vx *= -1
        if (node.y < 0.12 || node.y > 0.88) node.vy *= -1
      }
      paint()
      frame = requestAnimationFrame(step)
    })

    const onPointer = (event: PointerEvent) => {
      const rect = svg.getBoundingClientRect()
      pointerRef.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      }
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [count, accentKey, reduced, box])

  const linkCount = Math.min((count * (count - 1)) / 2, 120)

  return (
    <svg
      ref={svgRef}
      aria-hidden
      focusable="false"
      viewBox={`0 0 ${box.w} ${box.h}`}
      className="pointer-events-none absolute inset-0 size-full"
    >
      <g stroke="rgb(var(--primary))" strokeWidth="1" strokeLinecap="round">
        {Array.from({ length: linkCount }, (_, index) => (
          <line key={index} data-link opacity="0" />
        ))}
      </g>
      {Array.from({ length: count }, (_, index) => (
        <circle
          key={index}
          data-node
          r={index % 4 === 0 ? 3.5 : 2.2}
          opacity={index % 4 === 0 ? 0.9 : 0.6}
          fill={accents[index % Math.max(accents.length, 1)] ?? 'rgb(var(--primary))'}
        />
      ))}
    </svg>
  )
}
