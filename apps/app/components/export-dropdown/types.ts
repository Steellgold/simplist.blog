export type ExportFormat = "csv" | "json" | "xml";

export type ExportData = Record<string, unknown>[];

export interface ExportColumn {
  key: string;
  header: string;
  getValue?: (
    item: Record<string, unknown>,
  ) => string | number | boolean | null;
}

export interface ExportDropdownProps {
  data: ExportData;
  columns: ExportColumn[];
  filename: string;
  selectedCount?: number;
  children?: React.ReactNode;
}
