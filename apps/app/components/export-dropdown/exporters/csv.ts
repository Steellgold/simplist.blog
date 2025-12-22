import { escapeCSV } from "../utils/escape";
import { getValue } from "../utils/get-value";
import type { ExportColumn, ExportData } from "../types";

export const exportCSV = (
  data: ExportData,
  columns: ExportColumn[],
): string => {
  return [
    columns.map((c) => escapeCSV(c.header)).join(","),
    ...data.map((item) =>
      columns
        .map((col) =>
          escapeCSV(col.getValue?.(item) ?? getValue(item, col.key)),
        )
        .join(","),
    ),
  ].join("\n");
};
