import { detectFormat } from "./detect-format";
import { parseCSV } from "./parse-csv";
import { parseJSON } from "./parse-json";
import { parseXML } from "./parse-xml";
import type { ImportColumn, ImportData } from "../types";

export const parseFile = async (
  file: File,
  columns: ImportColumn[],
): Promise<ImportData> => {
  const content = await file.text();
  const format = detectFormat(content, file.name);

  if (!format) {
    throw new Error("Unsupported file format");
  }

  switch (format) {
    case "csv":
      return parseCSV(content, columns);
    case "json":
      return parseJSON(content, columns);
    case "xml":
      return parseXML(content, columns);
    default:
      throw new Error("Unsupported file format");
  }
};
