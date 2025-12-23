import type { ExportFormat, ExportData, ExportColumn } from "../types";
import { exportCSV } from "./csv";
import { exportJSON } from "./json";
import { exportXML } from "./xml";

type Exporter = (data: ExportData, columns: ExportColumn[]) => string;

export const exporters: Record<ExportFormat, Exporter> = {
  csv: exportCSV,
  json: exportJSON,
  xml: exportXML,
};

export const mimeTypes: Record<ExportFormat, string> = {
  csv: "text/csv;charset=utf-8;",
  json: "application/json;charset=utf-8;",
  xml: "application/xml;charset=utf-8;",
};
