import {
  Activity,
  BookOpen,
  Boxes,
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  Droplets,
  FileText,
  Flame,
  Gauge,
  GraduationCap,
  HardHat,
  LayoutDashboard,
  Leaf,
  MapPin,
  Microscope,
  Package,
  Scale,
  ShieldCheck,
  Siren,
  Stethoscope,
  ThermometerSun,
  TriangleAlert,
  Truck,
  Users,
  UtensilsCrossed,
  Wind,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

/**
 * Registry ikon: kolom `tools.icon` menyimpan NAMA (kebab-case), bukan komponen.
 * Set tunggal (lucide) sesuai CLAUDE.md §5; daftar dibatasi agar bundle tetap ramping.
 */
export const TOOL_ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  'book-open': BookOpen,
  boxes: Boxes,
  'calendar-check': CalendarCheck,
  'clipboard-check': ClipboardCheck,
  'clipboard-list': ClipboardList,
  droplets: Droplets,
  'file-text': FileText,
  flame: Flame,
  gauge: Gauge,
  'graduation-cap': GraduationCap,
  'hard-hat': HardHat,
  'layout-dashboard': LayoutDashboard,
  leaf: Leaf,
  'map-pin': MapPin,
  microscope: Microscope,
  package: Package,
  scale: Scale,
  'shield-check': ShieldCheck,
  siren: Siren,
  stethoscope: Stethoscope,
  'thermometer-sun': ThermometerSun,
  'triangle-alert': TriangleAlert,
  truck: Truck,
  users: Users,
  'utensils-crossed': UtensilsCrossed,
  wind: Wind,
  wrench: Wrench,
}

export const TOOL_ICON_NAMES = Object.keys(TOOL_ICONS)

/** Nama tak dikenal atau kosong tetap menghasilkan kartu yang utuh. */
export function resolveToolIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Boxes
  return TOOL_ICONS[name] ?? Boxes
}
