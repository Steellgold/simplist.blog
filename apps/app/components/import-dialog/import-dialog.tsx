"use client";

import { FileArrowUp } from "@gravity-ui/icons";
import { Button } from "@simplist/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@simplist/ui/components/dialog";
import { toast } from "@simplist/ui/components/sonner";
import { useMemo, useState } from "react";
import { ImportDialogFooter } from "./import-dialog-footer";
import { ImportDialogVariants } from "./import-dialog-variants";
import { ImportDropzone } from "./import-dropzone";
import type { ImportDialogProps } from "./types";
import { useImportDialog } from "./use-import-dialog";

interface Variant {
  lang: string;
  title: string;
}

interface ItemWithVariants {
  index: number;
  item: Record<string, unknown>;
  variants: Variant[];
}

export const ImportDialog = <T extends Record<string, unknown>>({
  columns,
  onImport,
  children,
  title = "Import data",
  description = "Upload a CSV, JSON, or XML file to import data.",
  entityName = "items",
  maxVariantsPerItem,
  disabled = false,
}: ImportDialogProps<T>) => {
  const [open, setOpen] = useState(false);

  const {
    file,
    data,
    error,
    importing,
    variantSelections,
    setVariantSelections,
    loadFile,
    importData,
    reset,
  } = useImportDialog({ columns, onImport, maxVariantsPerItem });

  // Detect items with multiple variants
  const itemsWithMultipleVariants = useMemo((): ItemWithVariants[] => {
    if (!maxVariantsPerItem || maxVariantsPerItem === -1) return [];

    return data
      .map((item, index) => {
        const variants = item.variants as Variant[] | undefined;
        if (variants && variants.length > maxVariantsPerItem) {
          return { index, item, variants };
        }
        return null;
      })
      .filter(Boolean) as ItemWithVariants[];
  }, [data, maxVariantsPerItem]);

  const hasMultipleVariants = itemsWithMultipleVariants.length > 0;

  const handleImport = async (): Promise<void> => {
    if (data.length === 0) return;

    // Check if all required variant selections are made
    if (hasMultipleVariants) {
      const missingSelections = itemsWithMultipleVariants.filter(
        ({ index }) => variantSelections[index] === undefined,
      );

      if (missingSelections.length > 0) {
        toast.error(
          "Please select a variant for each article with multiple variants",
        );
        return;
      }
    }

    const result = await importData();

    if (result.success) {
      toast.success(`Imported ${result.count || data.length} ${entityName}`);
      setOpen(false);
      reset();
    } else {
      toast.error(result.error || "Import failed");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (disabled && value) return;
        setOpen(value);
        if (!value) reset();
      }}
    >
      <DialogTrigger asChild disabled={disabled}>
        {children || (
          <Button variant="outline" disabled={disabled}>
            <FileArrowUp />
            <span className="hidden sm:inline">Import</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ImportDropzone file={file} onFile={loadFile} onClear={reset} />

          <ImportDialogVariants
            itemsWithMultipleVariants={itemsWithMultipleVariants}
            variantSelections={variantSelections}
            onVariantSelectionChange={(index, variantIndex) => {
              setVariantSelections((prev) => ({
                ...prev,
                [index]: variantIndex,
              }));
            }}
            maxVariantsPerItem={maxVariantsPerItem}
          />

          {error && (
            <div className="border-destructive/50 bg-destructive/10 rounded-md border p-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
        </div>

        <ImportDialogFooter
          onCancel={() => setOpen(false)}
          onImport={handleImport}
          importing={importing}
          dataLength={data.length}
          entityName={entityName}
        />
      </DialogContent>
    </Dialog>
  );
};
