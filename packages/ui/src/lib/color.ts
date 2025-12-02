import type { Color } from "@simplist/db";
import { z } from "zod";

type ColorMapResult = {
  value: string;
  label: string;
};

export const ColorsEnum = z.enum([
  "RED", "ORANGE", "AMBER", "YELLOW", "LIME", "GREEN", "EMERALD", "TEAL", "CYAN", "SKY",
  "BLUE", "INDIGO", "VIOLET", "PURPLE", "FUCHSIA", "PINK", "ROSE", "BLACK", "WHITE", "GRAY"
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
  GRAY: { value: "#9CA3AF", label: "Gray" }
};

const lightTextColors: ColorsEnumType[] = [
  "BLACK", "RED", "ORANGE", "SKY", "BLUE", "INDIGO", "VIOLET", "PURPLE", "FUCHSIA", "PINK", "ROSE"
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
