import type { ImportColumn, ImportData, ParsedRow } from "../types";

export const parseJSON = (
  content: string,
  columns: ImportColumn[],
): ImportData => {
  const parsed = JSON.parse(content);
  const items = Array.isArray(parsed) ? parsed : [parsed];

  return items.map((item) => {
    const row: ParsedRow = {};
    for (const col of columns) {
      if (item[col.key] !== undefined) {
        const value = item[col.key];
        row[col.key] = col.transform ? col.transform(String(value)) : value;
      }
    }
    return row;
  });
};
