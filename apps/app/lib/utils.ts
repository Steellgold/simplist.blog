import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const SlugSchema = z.string().slugify();

export const generateSlug = (text: string): string => {
  return SlugSchema.parse(text);
};

export const sanitizeFileName = (name: string) => {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const replaced = normalized.replace(/\s+/g, "-");

  let cleaned = replaced.replace(/[^a-z0-9._-]/g, "");

  cleaned = cleaned.replace(/[-_.]{2,}/g, (s) => (s.includes(".") ? "." : "-"));

  cleaned = cleaned.replace(/^[._-]+|[._-]+$/g, "");

  return cleaned || `file-${Date.now()}`;
};

export const getRedirectUrl = () => {
  if (typeof window === "undefined") return "/";
  const params = new URLSearchParams(window.location.search);
  return params.get("redirect") || "/";
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
