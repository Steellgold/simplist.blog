import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const getInitials = (name: string | null | undefined): string => {
  if (!name) return "?";

  const allInitials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const words = name.split(" ");
  if (words.length >= 2) {
    return allInitials.slice(0, 2);
  }

  return name.substring(0, 2).toUpperCase();
};

export const toKebabCase = (str: string): string => {
  return str.toLowerCase().replace(/ /g, "-");
};

export const toPascalCase = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
