import { Dispatch, SetStateAction, useState } from "react";
import { parseFile } from "./parsers/parse-file";
import { validateRequired } from "./validators/validate-required";
import type {
  ImportColumn,
  ImportDialogProps,
  ImportData,
  ImportResult,
} from "./types";

interface UseImportDialogProps<T> {
  columns: ImportColumn[];
  onImport: ImportDialogProps<T>["onImport"];
  maxVariantsPerItem?: number;
}

interface UseImportDialogReturn {
  file: File | null;
  data: ImportData;
  error: string | null;
  importing: boolean;
  variantSelections: Record<number, number>;
  setVariantSelections: Dispatch<
    SetStateAction<Record<number, number>>
  >;
  loadFile: (file: File) => Promise<void>;
  importData: () => Promise<ImportResult>;
  reset: () => void;
}

export const useImportDialog = <T>({
  columns,
  onImport,
}: UseImportDialogProps<T>): UseImportDialogReturn => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ImportData>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [variantSelections, setVariantSelections] = useState<
    Record<number, number>
  >({});

  const reset = (): void => {
    setFile(null);
    setData([]);
    setError(null);
    setVariantSelections({});
  };

  const loadFile = async (file: File): Promise<void> => {
    setFile(file);
    setError(null);
    setVariantSelections({});

    try {
      const parsed = await parseFile(file, columns);
      if (parsed.length === 0) {
        throw new Error("No valid data found in file");
      }

      const validation = validateRequired(parsed, columns);
      if (validation) {
        setError(
          `${validation.count} row(s) missing required fields: ${validation.fields.join(", ")}`,
        );
      }

      setData(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse file");
      setData([]);
    }
  };

  const importData = async (): Promise<ImportResult> => {
    setImporting(true);
    try {
      return await onImport(
        data as T[],
        Object.keys(variantSelections).length ? variantSelections : undefined,
      );
    } finally {
      setImporting(false);
    }
  };

  return {
    file,
    data,
    error,
    importing,
    variantSelections,
    setVariantSelections,
    loadFile,
    importData,
    reset,
  };
};
