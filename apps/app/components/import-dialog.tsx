"use client";

import { Button } from "@simplist/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@simplist/ui/components/dialog";
import { Dropzone } from "@simplist/ui/components/dropzone";
import { toast } from "@simplist/ui/components/sonner";
import { Spinner } from "@simplist/ui/components/spinner";
import { Upload } from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";

export type ImportFormat = "csv" | "json" | "xml";

export interface ImportColumn {
  key: string;
  header: string;
  required?: boolean;
  transform?: (value: string) => unknown;
}

export interface ImportDialogProps<T> {
  columns: ImportColumn[];
  onImport: (
    data: T[],
  ) => Promise<{ success: boolean; count?: number; error?: string }>;
  children?: ReactNode;
  title?: string;
  description?: string;
  entityName?: string;
}

const detectFormat = (
  content: string,
  filename: string,
): ImportFormat | null => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "csv") return "csv";
  if (ext === "json") return "json";
  if (ext === "xml") return "xml";

  // Try to detect from content
  const trimmed = content.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json";
  if (trimmed.startsWith("<?xml") || trimmed.startsWith("<")) return "xml";
  return "csv";
};

const parseCSV = (
  content: string,
  columns: ImportColumn[],
): Record<string, unknown>[] => {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0]!
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
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

  const results: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!;
    if (!line.trim()) continue;

    // Parse CSV line handling quoted values
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, unknown> = {};
    for (const col of columns) {
      const index = headerMap.get(col.key);
      if (index !== undefined && values[index] !== undefined) {
        const value = values[index]!.replace(/^"|"$/g, "");
        row[col.key] = col.transform ? col.transform(value) : value;
      }
    }
    results.push(row);
  }

  return results;
};

const parseJSON = (
  content: string,
  columns: ImportColumn[],
): Record<string, unknown>[] => {
  const parsed = JSON.parse(content);
  const items = Array.isArray(parsed) ? parsed : [parsed];

  return items.map((item) => {
    const row: Record<string, unknown> = {};
    for (const col of columns) {
      if (item[col.key] !== undefined) {
        const value = item[col.key];
        row[col.key] = col.transform ? col.transform(String(value)) : value;
      }
    }
    return row;
  });
};

const parseXML = (
  content: string,
  columns: ImportColumn[],
): Record<string, unknown>[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/xml");
  const items = doc.querySelectorAll("item");

  const results: Record<string, unknown>[] = [];

  items.forEach((item) => {
    const row: Record<string, unknown> = {};
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

export function ImportDialog<T extends Record<string, unknown>>({
  columns,
  onImport,
  children,
  title = "Import data",
  description = "Upload a CSV, JSON, or XML file to import data.",
  entityName = "items",
}: ImportDialogProps<T>) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, unknown>[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
  };

  const handleFile = useCallback(
    async (selectedFile: File) => {
      setFile(selectedFile);
      setError(null);

      try {
        const content = await selectedFile.text();
        const format = detectFormat(content, selectedFile.name);

        if (!format) {
          setError(
            "Could not detect file format. Please use CSV, JSON, or XML.",
          );
          return;
        }

        let data: Record<string, unknown>[];

        switch (format) {
          case "csv":
            data = parseCSV(content, columns);
            break;
          case "json":
            data = parseJSON(content, columns);
            break;
          case "xml":
            data = parseXML(content, columns);
            break;
          default:
            setError("Unsupported format");
            return;
        }

        if (data.length === 0) {
          setError("No valid data found in file");
          return;
        }

        // Validate required fields
        const requiredCols = columns.filter((c) => c.required);
        const invalidRows = data.filter((row) =>
          requiredCols.some((col) => !row[col.key]),
        );

        if (invalidRows.length > 0) {
          setError(
            `${invalidRows.length} row(s) missing required fields: ${requiredCols.map((c) => c.header).join(", ")}`,
          );
        }

        setParsedData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse file");
        setParsedData([]);
      }
    },
    [columns],
  );

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setIsImporting(true);

    try {
      const result = await onImport(parsedData as T[]);

      if (result.success) {
        toast.success(
          `Imported ${result.count || parsedData.length} ${entityName}`,
        );
        setOpen(false);
        reset();
      } else {
        setError(result.error || "Import failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) reset();
      }}
    >
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Upload />
            Import
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          <Dropzone
            size="sm"
            onDrop={(files) => {
              const droppedFile = files[0];
              if (droppedFile) handleFile(droppedFile);
            }}
            accept={{
              "text/csv": [".csv"],
              "application/json": [".json"],
              "text/xml": [".xml"],
              "application/xml": [".xml"],
            }}
            multiple={false}
            file={file ? { file, name: file.name } : null}
            onClear={reset}
            label="Upload file"
            description="or drag and drop"
            hint="CSV, JSON, XML"
          />

          {/* Preview */}
          {parsedData.length > 0 && (
            <div className="bg-muted/50 rounded-md border p-3">
              <p className="text-sm">
                <span className="font-medium">{parsedData.length}</span>{" "}
                {entityName} ready to import
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="border-destructive/50 bg-destructive/10 rounded-md border p-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Expected columns info */}
          <div className="text-muted-foreground text-xs">
            <p className="font-medium">Expected columns:</p>
            <p>{columns.map((c) => c.header).join(", ")}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={isImporting || parsedData.length === 0}
          >
            {isImporting ? (
              <Spinner />
            ) : (
              `Import ${parsedData.length > 0 ? parsedData.length : ""} ${entityName}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
