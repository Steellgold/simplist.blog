import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const textToId = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

export const generateUniqueId = (
  text: string,
  existing: Set<string>,
): string => {
  let id = textToId(text);
  let counter = 1;
  const originalId = id;

  while (existing.has(id)) {
    id = `${originalId}-${counter}`;
    counter++;
  }

  existing.add(id);
  return id;
};
