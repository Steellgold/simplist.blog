import { IconsEnumType } from "@simplist/ui/lib/icons.enum";

export type IconData = {
  name: string;
  categories: string[];
  tags: string[];
};

export type IconPickerProps = {
  value?: IconsEnumType;
  onValueChange?: (value: IconsEnumType) => void;
  placeholder?: string;
  className?: string;
  iconsPerBatch?: number;
  disabled?: boolean;
  dialog?: boolean;
  dialogTrigger?: React.ReactNode;
};

export type IconPickerMode = "dialog" | "popover" | "drawer";

export const DEFAULT_ICONS_PER_BATCH = 100;
