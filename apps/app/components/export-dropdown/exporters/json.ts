import { getValue } from "../utils/get-value";
import type { ExportColumn, ExportData } from "../types";

export const exportJSON = (
  data: ExportData,
  columns: ExportColumn[],
): string => {
  const jsonData = data.map((item) => {
    const obj: Record<string, unknown> = {};
    for (const col of columns) {
      obj[col.key] = col.getValue?.(item) ?? getValue(item, col.key);
    }
    return obj;
  });

  return JSON.stringify(jsonData, null, 2);
};
