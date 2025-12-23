import { toast } from "@simplist/ui/components/sonner";
import { downloadFile } from "./utils/download-file";
import { exporters, mimeTypes } from "./exporters";
import type { ExportColumn, ExportFormat, ExportData } from "./types";

interface UseExportProps {
  data: ExportData;
  columns: ExportColumn[];
  filename: string;
}

interface UseExportReturn {
  run: (format: ExportFormat) => void;
}

export const useExport = ({
  data,
  columns,
  filename,
}: UseExportProps): UseExportReturn => {
  const date = new Date().toISOString().split("T")[0];

  const run = (format: ExportFormat): void => {
    const content = exporters[format](data, columns);
    downloadFile(content, `${filename}-${date}.${format}`, mimeTypes[format]);
    toast.success(`Exported ${data.length} item(s) to ${format.toUpperCase()}`);
  };

  return { run };
};
