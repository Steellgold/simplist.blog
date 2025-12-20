import type { Color } from "@simplist/db";
import { z } from "zod";

type ColorMapResult = {
  value: string;
  label: string;
};

export const ColorsEnum = z.enum([
  "RED",
  "ORANGE",
  "AMBER",
  "YELLOW",
  "LIME",
  "GREEN",
  "EMERALD",
  "TEAL",
  "CYAN",
  "SKY",
  "BLUE",
  "INDIGO",
  "VIOLET",
  "PURPLE",
  "FUCHSIA",
  "PINK",
  "ROSE",
  "BLACK",
  "WHITE",
  "GRAY",
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
};

const lightTextColors: ColorsEnumType[] = [
  "BLACK",
  "RED",
  "ORANGE",
  "SKY",
  "BLUE",
  "INDIGO",
  "VIOLET",
  "PURPLE",
  "FUCHSIA",
  "PINK",
  "ROSE",
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
};

const getTextColor = (backgroundColor: string): string => {
  const luminance = getLuminance(backgroundColor);
  return luminance > 0.5 ? "#000000" : "#ffffff";
};

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

export const getTagColorClasses = (
  color: ColorsEnumType | Color | null,
): string => {
  if (!color) return "";

  const colorMap: Record<ColorsEnumType | Color, string> = {
    RED: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800",
    ORANGE:
      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-800",
    AMBER:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
    YELLOW:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800",
    LIME: "bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-950 dark:text-lime-200 dark:border-lime-800",
    GREEN:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800",
    EMERALD:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
    TEAL: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-200 dark:border-teal-800",
    CYAN: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-200 dark:border-cyan-800",
    SKY: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800",
    BLUE: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800",
    INDIGO:
      "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-800",
    VIOLET:
      "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950 dark:text-violet-200 dark:border-violet-800",
    PURPLE:
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800",
    FUCHSIA:
      "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-950 dark:text-fuchsia-200 dark:border-fuchsia-800",
    PINK: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-950 dark:text-pink-200 dark:border-pink-800",
    ROSE: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800",
    BLACK:
      "bg-gray-900 text-white border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:border-gray-900",
    WHITE:
      "bg-white text-gray-900 border-gray-200 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-300",
    GRAY: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950 dark:text-gray-200 dark:border-gray-800",
  };

  return colorMap[color] || "";
};
