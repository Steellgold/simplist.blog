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
import { Upload, AlertTriangle, Languages } from "lucide-react";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@simplist/ui/components/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@simplist/ui/components/alert";

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
    variantSelections?: Record<number, number>,
  ) => Promise<{ success: boolean; count?: number; error?: string }>;
  children?: ReactNode;
  title?: string;
  description?: string;
  entityName?: string;
  maxVariantsPerItem?: number;
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
  const results: Record<string, unknown>[] = [];

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
    const row: Record<string, unknown> = {};

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
  maxVariantsPerItem,
}: ImportDialogProps<T>) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, unknown>[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variantSelections, setVariantSelections] = useState<
    Record<number, number>
  >({});

  const reset = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
    setVariantSelections({});
  };

  // Detect items with multiple variants
  const itemsWithMultipleVariants = useMemo(() => {
    if (!maxVariantsPerItem || maxVariantsPerItem === -1) return [];

    return parsedData
      .map((item, index) => {
        const variants = item.variants as
          | Array<{ lang: string; title: string }>
          | undefined;
        if (variants && variants.length > maxVariantsPerItem) {
          return { index, item, variants };
        }
        return null;
      })
      .filter(Boolean) as Array<{
      index: number;
      item: Record<string, unknown>;
      variants: Array<{ lang: string; title: string }>;
    }>;
  }, [parsedData, maxVariantsPerItem]);

  const hasMultipleVariants = itemsWithMultipleVariants.length > 0;

  const handleFile = useCallback(
    async (selectedFile: File) => {
      setFile(selectedFile);
      setError(null);
      setVariantSelections({});

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

    // Check if all required variant selections are made
    if (hasMultipleVariants) {
      const missingSelections = itemsWithMultipleVariants.filter(
        ({ index }) => variantSelections[index] === undefined,
      );

      if (missingSelections.length > 0) {
        setError(
          "Please select a variant for each article with multiple variants",
        );
        return;
      }
    }

    setIsImporting(true);

    try {
      const result = await onImport(
        parsedData as T[],
        hasMultipleVariants ? variantSelections : undefined,
      );

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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
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

          {/* Variants warning */}
          {hasMultipleVariants && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Multiple variants detected</AlertTitle>
              <AlertDescription>
                {itemsWithMultipleVariants.length} article(s) have more than{" "}
                {maxVariantsPerItem} variant(s). Please select which variant to
                import for each article below.
              </AlertDescription>
            </Alert>
          )}

          {/* Variant selection */}
          {hasMultipleVariants && (
            <div className="max-h-60 space-y-3 overflow-y-auto rounded-md border p-3">
              <div className="bg-background sticky top-0 flex items-center gap-2 pb-2 text-sm font-medium">
                <Languages className="h-4 w-4" />
                Select variants to import
              </div>
              {itemsWithMultipleVariants.map(({ index, item, variants }) => (
                <div
                  key={index}
                  className="bg-muted/20 space-y-2 rounded-md border p-3"
                >
                  <div className="truncate text-sm font-medium">
                    {String(item.title || `Article ${index + 1}`)}
                  </div>
                  <Select
                    value={String(variantSelections[index] ?? "")}
                    onValueChange={(value) => {
                      setVariantSelections((prev) => ({
                        ...prev,
                        [index]: Number(value),
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a variant to import" />
                    </SelectTrigger>
                    <SelectContent>
                      {variants.map((variant, variantIndex) => (
                        <SelectItem
                          key={variantIndex}
                          value={String(variantIndex)}
                        >
                          {variant.lang.toUpperCase()} - {variant.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}

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
