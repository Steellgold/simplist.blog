import { escapeXML } from "../utils/escape";
import { getValue } from "../utils/get-value";
import type { ExportColumn, ExportData } from "../types";

export const exportXML = (
  data: ExportData,
  columns: ExportColumn[],
): string => {
  const xmlItems = data
    .map((item) => {
      const fields = columns
        .map((col) => {
          const value = col.getValue?.(item) ?? getValue(item, col.key);
          const tagName = col.key.replace(/[^a-zA-Z0-9]/g, "_");
          return `    <${tagName}>${escapeXML(value)}</${tagName}>`;
        })
        .join("\n");
      return `  <item>\n${fields}\n  </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<data>\n${xmlItems}\n</data>`;
};
