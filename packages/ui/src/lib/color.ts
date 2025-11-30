import type { Color } from "@simplist/db";
import { z } from "zod";

type ColorMapResult = {
  value: string;
  label: string;
};

export const ColorsEnum = z.enum([
  "RED", "ORANGE", "AMBER", "YELLOW", "LIME", "GREEN", "EMERALD", "TEAL", "CYAN", "SKY",
  "BLUE", "INDIGO", "VIOLET", "PURPLE", "FUCHSIA", "PINK", "ROSE", "BLACK", "WHITE",

  "GRAY", "SLATE", "STONE", "ZINC", "NEON_GREEN", "NEON_PINK", "MINT", "AQUA", "TURQUOISE",
  "BRONZE", "GOLD", "SILVER", "COPPER", "MAROON", "OLIVE", "NAVY", "LAVENDER", "BEIGE", "PEACH",
  "BROWN", "CHARCOAL",

  "MAGENTA", "CORAL", "SAPPHIRE", "RUBY", "SAND", "MUSTARD", "ICE", "JADE", "PLUM",
  "SEAFOAM", "INDIGO_DARK", "LIME_DARK", "BERRY", "MOSS", "FLAMINGO", "ICE_BLUE",
  "MULBERRY", "MANGO", "OBSIDIAN", "WISTERIA"
]);

export type ColorsEnumType = z.infer<typeof ColorsEnum>;

export const c = (value: string): ColorsEnumType => {
  return ColorsEnum.parse(value ?? "CYAN");
};

export const COLOR_MAP: Record<ColorsEnumType | Color, ColorMapResult> = {
  RED: { value: "#EF4444", label: "Red" },
  ORANGE: { value: "#F97316", label: "Orange" },
  AMBER: { value: "#F59E0B", label: "Amber" },
  YELLOW: { value: "#EAB308", label: "Yellow" },
  LIME: { value: "#84CC16", label: "Lime" },
  GREEN: { value: "#22C55E", label: "Green" },
  EMERALD: { value: "#10B981", label: "Emerald" },
  TEAL: { value: "#14B8A6", label: "Teal" },
  CYAN: { value: "#06B6D4", label: "Cyan" },
  SKY: { value: "#0EA5E9", label: "Sky" },
  BLUE: { value: "#3B82F6", label: "Blue" },
  INDIGO: { value: "#6366F1", label: "Indigo" },
  VIOLET: { value: "#8B5CF6", label: "Violet" },
  PURPLE: { value: "#A855F7", label: "Purple" },
  FUCHSIA: { value: "#D946EF", label: "Fuchsia" },
  PINK: { value: "#EC4899", label: "Pink" },
  ROSE: { value: "#F43F5E", label: "Rose" },
  BLACK: { value: "#000000", label: "Black" },
  WHITE: { value: "#FFFFFF", label: "White" },

  GRAY: { value: "#9CA3AF", label: "Gray" },
  SLATE: { value: "#64748B", label: "Slate" },
  STONE: { value: "#78716C", label: "Stone" },
  ZINC: { value: "#71717A", label: "Zinc" },
  NEON_GREEN: { value: "#39FF14", label: "Neon Green" },
  NEON_PINK: { value: "#FF6EC7", label: "Neon Pink" },
  MINT: { value: "#98FF98", label: "Mint" },
  AQUA: { value: "#00FFFF", label: "Aqua" },
  TURQUOISE: { value: "#40E0D0", label: "Turquoise" },
  BRONZE: { value: "#CD7F32", label: "Bronze" },
  GOLD: { value: "#FFD700", label: "Gold" },
  SILVER: { value: "#C0C0C0", label: "Silver" },
  COPPER: { value: "#B87333", label: "Copper" },
  MAROON: { value: "#800000", label: "Maroon" },
  OLIVE: { value: "#808000", label: "Olive" },
  NAVY: { value: "#000080", label: "Navy" },
  LAVENDER: { value: "#E6E6FA", label: "Lavender" },
  BEIGE: { value: "#F5F5DC", label: "Beige" },
  PEACH: { value: "#FFE5B4", label: "Peach" },
  BROWN: { value: "#A52A2A", label: "Brown" },
  CHARCOAL: { value: "#36454F", label: "Charcoal" },

  MAGENTA: { value: "#FF00FF", label: "Magenta" },
  CORAL: { value: "#FF7F50", label: "Coral" },
  SAPPHIRE: { value: "#0F52BA", label: "Sapphire" },
  RUBY: { value: "#E0115F", label: "Ruby" },
  SAND: { value: "#F4A460", label: "Sand" },
  MUSTARD: { value: "#FFDB58", label: "Mustard" },
  ICE: { value: "#D6FFFA", label: "Ice" },
  JADE: { value: "#00A86B", label: "Jade" },
  PLUM: { value: "#DDA0DD", label: "Plum" },
  SEAFOAM: { value: "#93E9BE", label: "Seafoam" },
  INDIGO_DARK: { value: "#3F00FF", label: "Dark Indigo" },
  LIME_DARK: { value: "#4B830D", label: "Dark Lime" },
  BERRY: { value: "#8A0253", label: "Berry" },
  MOSS: { value: "#8A9A5B", label: "Moss" },
  FLAMINGO: { value: "#FC8EAC", label: "Flamingo" },
  ICE_BLUE: { value: "#AFDBF5", label: "Ice Blue" },
  MULBERRY: { value: "#70193D", label: "Mulberry" },
  MANGO: { value: "#FFB347", label: "Mango" },
  OBSIDIAN: { value: "#0B0C10", label: "Obsidian" },
  WISTERIA: { value: "#C9A0DC", label: "Wisteria" }
};

const lightTextColors: ColorsEnumType[] = [
  "BLACK", "RED", "ORANGE", "SKY", "BLUE", "INDIGO", "VIOLET", "PURPLE", "FUCHSIA",
  "PINK", "ROSE", "MAROON", "BERRY", "NAVY", "INDIGO_DARK", "OBSIDIAN", "CHARCOAL", "MULBERRY",
  "RUBY"
];

export const getIconTextColorWithBackgroundColorOf = (
  color: ColorsEnumType | Color,
): string => {
  if (!COLOR_MAP[color]) return "#000000";
  return lightTextColors.includes(color as ColorsEnumType)
    ? "#ffffff"
    : "#000000";
};

export const COLORS = Object.keys(COLOR_MAP) as ColorsEnumType[];

export const getColorValue = (color: ColorsEnumType): string => {
  return COLOR_MAP[color]?.value || COLOR_MAP.CYAN.value;
};

export const getColorLabel = (color: ColorsEnumType): string => {
  return COLOR_MAP[color]?.label || COLOR_MAP.CYAN.label;
};

const getLuminance = (hex: string): number => {
  const rgb = hex.replace("#", "");
  const r = parseInt(rgb.substr(0, 2), 16) / 255;
  const g = parseInt(rgb.substr(2, 2), 16) / 255;
  const b = parseInt(rgb.substr(4, 2), 16) / 255;

  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

const getTextColor = (backgroundColor: string): string => {
  const luminance = getLuminance(backgroundColor);
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

export const getTagStyles = (
  color: ColorsEnumType | Color,
): React.CSSProperties => {
  const colorInfo = COLOR_MAP[color];

  if (!colorInfo) {
    return {
      backgroundColor: "#6b7280",
      color: "#ffffff",
      border: "1px solid #6b7280",
    };
  }

  const backgroundColor = colorInfo.value;
  const textColor = getTextColor(backgroundColor);

  return {
    backgroundColor: `${backgroundColor}50`,
    color: `${textColor}`,
    border: `1px solid ${backgroundColor}70`,
  };
};
