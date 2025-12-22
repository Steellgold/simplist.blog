import type { ImportFormat } from "../types";

export const detectFormat = (
  content: string,
  filename: string,
): ImportFormat | null => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "csv") return "csv";
  if (ext === "json") return "json";
  if (ext === "xml") return "xml";

  // Try to detect from content
  const trimmed = content.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json";
  if (trimmed.startsWith("<?xml") || trimmed.startsWith("<")) return "xml";
  return "csv";
};
