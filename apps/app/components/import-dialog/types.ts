import type { ReactNode } from "react";

export type ImportFormat = "csv" | "json" | "xml";

export type ImportData = Record<string, unknown>[];

export type ParsedRow = Record<string, unknown>;

export interface ImportColumn {
  key: string;
  header: string;
  required?: boolean;
  transform?: (value: string) => unknown;
}

export interface ImportResult {
  success: boolean;
  count?: number;
  error?: string;
}

export interface ImportDialogProps<T> {
  columns: ImportColumn[];
  onImport: (
    data: T[],
    variantSelections?: Record<number, number>,
  ) => Promise<ImportResult>;
  children?: ReactNode;
  title?: string;
  description?: string;
  entityName?: string;
  maxVariantsPerItem?: number;
  disabled?: boolean;
}
