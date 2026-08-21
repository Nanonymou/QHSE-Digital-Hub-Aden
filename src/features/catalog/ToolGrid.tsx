import { motion, useReducedMotion } from 'framer-motion'
import type { ToolWithCategory } from '@/types/database'
import { ToolCard } from './ToolCard'

type ToolGridProps = {
  tools: ToolWithCategory[]
  onLaunch: (tool: ToolWithCategory) => void
  onDetail: (tool: ToolWithCategory) => void
}

/** Grid responsif 1 → 2 → 3 kolom dengan stagger reveal saat masuk viewport (features/01). */
export function ToolGrid({ tools, onLaunch, onDetail }: ToolGridProps) {
  const reduced = useReducedMotion()

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool, index) => (
        <motion.li
          key={tool.id}
          className="h-full"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: Math.min(index, 7) * 0.05 }
          }
        >
          <ToolCard tool={tool} onLaunch={onLaunch} onDetail={onDetail} />
        </motion.li>
      ))}
    </ul>
  )
}
