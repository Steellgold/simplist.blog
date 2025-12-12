import type { Color } from "@simplist/db"

export const COLOR_HEX_MAP: Record<Color, string> = {
  RED: "#EF4444",
  ORANGE: "#F97316",
  AMBER: "#F59E0B",
  YELLOW: "#EAB308",
  LIME: "#84CC16",
  GREEN: "#22C55E",
  EMERALD: "#10B981",
  TEAL: "#14B8A6",
  CYAN: "#06B6D4",
  SKY: "#0EA5E9",
  BLUE: "#3B82F6",
  INDIGO: "#6366F1",
  VIOLET: "#8B5CF6",
  PURPLE: "#A855F7",
  FUCHSIA: "#D946EF",
  PINK: "#EC4899",
  ROSE: "#F43F5E",
  BLACK: "#000000",
  WHITE: "#FFFFFF",
  GRAY: "#9CA3AF"
}

export const getColorHex = (color: Color | null): string | null => {
  if (!color) return null
  return COLOR_HEX_MAP[color] || null
}
