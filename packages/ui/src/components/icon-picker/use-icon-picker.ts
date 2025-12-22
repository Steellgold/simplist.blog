import { IconsEnumType } from "@simplist/ui/lib/icons.enum";
import { useEffect, useState } from "react";
import { DEFAULT_ICONS_PER_BATCH } from "./types";

type UseIconPickerParams = {
  value?: IconsEnumType;
  iconsPerBatch?: number;
  dialog: boolean;
};

export function useIconPicker({
  value,
  iconsPerBatch = DEFAULT_ICONS_PER_BATCH,
  dialog,
}: UseIconPickerParams) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<IconsEnumType | undefined>(value);

  // Synchronize selected with value prop when it changes
  useEffect(() => {
    setSelected(value);
  }, [value]);

  const reset = () => {
    setSearch("");
    setCategory("All");
  };

  const close = () => {
    setOpen(false);
    reset();
    if (dialog) {
      setSelected(value);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      close();
    }
  };

  return {
    open,
    setOpen,
    close,
    handleOpenChange,
    search,
    setSearch,
    category,
    setCategory,
    selected,
    setSelected,
    reset,
    iconsPerBatch,
  };
}
