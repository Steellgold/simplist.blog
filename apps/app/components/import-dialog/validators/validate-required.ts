import type { ImportColumn, ImportData } from "../types";

export interface ValidationError {
  count: number;
  fields: string[];
}

export const validateRequired = (
  data: ImportData,
  columns: ImportColumn[],
): ValidationError | null => {
  const required = columns.filter((c) => c.required);
  if (required.length === 0) return null;

  const invalid = data.filter((row) => required.some((col) => !row[col.key]));

  if (invalid.length === 0) return null;

  return {
    count: invalid.length,
    fields: required.map((c) => c.header),
  };
};
