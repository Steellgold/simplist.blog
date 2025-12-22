import type { ImportColumn, ImportData, ParsedRow } from "../types";

export const parseXML = (
  content: string,
  columns: ImportColumn[],
): ImportData => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/xml");
  const items = doc.querySelectorAll("item");

  const results: ImportData = [];

  items.forEach((item) => {
    const row: ParsedRow = {};
    for (const col of columns) {
      const tagName = col.key.replace(/[^a-zA-Z0-9]/g, "_");
      const element = item.querySelector(tagName);
      if (element) {
        const value = element.textContent || "";
        row[col.key] = col.transform ? col.transform(value) : value;
      }
    }
    results.push(row);
  });

  return results;
};
