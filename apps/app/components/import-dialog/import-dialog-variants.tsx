import { cn } from "@/lib/utils";
import { TriangleExclamationFill } from "@gravity-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@simplist/ui/components/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@simplist/ui/components/select";

interface Variant {
  lang: string;
  title: string;
}

interface ItemWithVariants {
  index: number;
  item: Record<string, unknown>;
  variants: Variant[];
}

interface ImportDialogVariantsProps {
  itemsWithMultipleVariants: ItemWithVariants[];
  variantSelections: Record<number, number>;
  onVariantSelectionChange: (index: number, variantIndex: number) => void;
  maxVariantsPerItem?: number;
}

export const ImportDialogVariants = ({
  itemsWithMultipleVariants,
  variantSelections,
  onVariantSelectionChange,
  maxVariantsPerItem,
}: ImportDialogVariantsProps) => {
  if (itemsWithMultipleVariants.length === 0) return null;

  return (
    <div>
      <Alert
        variant="destructive"
        className="rounded-t-xl rounded-b-none border-b-0"
      >
        <TriangleExclamationFill className="h-4 w-4" />
        <AlertTitle>Multiple variants detected</AlertTitle>
        <AlertDescription>
          {itemsWithMultipleVariants.length} article(s) have more than{" "}
          {maxVariantsPerItem} variant(s). Please select which variant to import
          for each article below.
        </AlertDescription>
      </Alert>

      <div className="overflow-y-auto rounded-b-xl">
        {itemsWithMultipleVariants.map(({ index, item, variants }) => (
          <div
            key={index}
            className={cn("bg-card space-y-2 border-x p-3", {
              "border-b": index === itemsWithMultipleVariants.length - 1,
            })}
          >
            <div className="truncate text-sm font-medium">
              {String(item.title || `Article ${index + 1}`)}
            </div>
            <Select
              value={String(variantSelections[index] ?? "")}
              onValueChange={(value) => {
                onVariantSelectionChange(index, Number(value));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a variant to import" />
              </SelectTrigger>
              <SelectContent>
                {variants.map((variant, variantIndex) => (
                  <SelectItem key={variantIndex} value={String(variantIndex)}>
                    {variant.lang.toUpperCase()} - {variant.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
};
