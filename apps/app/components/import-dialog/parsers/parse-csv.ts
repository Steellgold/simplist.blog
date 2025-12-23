import type { ImportColumn, ImportData, ParsedRow } from "../types";

export const parseCSV = (
  content: string,
  columns: ImportColumn[],
): ImportData => {
  const results: ImportData = [];

  // Parse entire CSV content handling multiline fields
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  // Parse character by character to handle multiline fields
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      currentRow.push(currentField);
      currentField = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      // End of row (handle both \n and \r\n)
      if (char === "\r" && nextChar === "\n") {
        i++; // Skip the \n in \r\n
      }
      currentRow.push(currentField);
      if (currentRow.some((field) => field.trim())) {
        // Only add non-empty rows
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }

  // Add last field and row if any
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((field) => field.trim())) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0]!.map((h) => h.trim().replace(/^"|"$/g, ""));
  const headerMap = new Map<string, number>();

  headers.forEach((header, index) => {
    const col = columns.find(
      (c) =>
        c.header.toLowerCase() === header.toLowerCase() ||
        c.key.toLowerCase() === header.toLowerCase(),
    );
    if (col) {
      headerMap.set(col.key, index);
    }
  });

  // Parse data rows
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i]!;
    const row: ParsedRow = {};

    for (const col of columns) {
      const index = headerMap.get(col.key);
      if (index !== undefined && values[index] !== undefined) {
        const value = values[index]!.trim().replace(/^"|"$/g, "");
        row[col.key] = col.transform ? col.transform(value) : value;
      }
    }

    // Only add rows with at least one non-empty value
    if (Object.values(row).some((v) => v && String(v).trim())) {
      results.push(row);
    }
  }

  return results;
};
