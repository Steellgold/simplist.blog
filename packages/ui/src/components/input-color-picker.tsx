"use client";

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerEyeDropper,
  ColorPickerFormatSelect,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from "@simplist/ui/components/color-picker";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@simplist/ui/components/input-group";
import * as React from "react";

interface ColorPickerInputGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

export const ColorPickerInputGroup = ({
  value: controlledValue,
  onValueChange,
  defaultValue = "#3b82f6",
}: ColorPickerInputGroupProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [inputValue, setInputValue] = React.useState(defaultValue);
  const [isTyping, setIsTyping] = React.useState(false);

  const value = controlledValue ?? internalValue;

  // Synchronise l'input avec la valeur du ColorPicker uniquement si on ne tape pas
  React.useEffect(() => {
    if (!isTyping) {
      setInputValue(value);
    }
  }, [value, isTyping]);

  const handleColorChange = (newColor: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newColor);
    }
    onValueChange?.(newColor);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTyping(true);
    let newValue = e.target.value;

    // Ajoute automatiquement le # si l'utilisateur commence à taper sans
    if (newValue.length > 0 && !newValue.startsWith("#")) {
      newValue = "#" + newValue;
    }

    setInputValue(newValue);

    // Met à jour uniquement si la couleur est complète et valide
    if (
      /^#([0-9A-F]{6})$/i.test(newValue) ||
      /^#([0-9A-F]{3})$/i.test(newValue)
    ) {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    }
  };

  const handleInputBlur = () => {
    setIsTyping(false);
    // Restaure la dernière couleur valide si l'input n'est pas valide
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(inputValue)) {
      setInputValue(value);
    } else if (/^#([0-9A-F]{3})$/i.test(inputValue)) {
      // Si c'est une couleur courte valide (#FFF), on la garde
      if (controlledValue === undefined) {
        setInternalValue(inputValue);
      }
      onValueChange?.(inputValue);
    }
  };

  const handleInputFocus = () => {
    setIsTyping(true);
  };

  return (
    <ColorPicker
      value={value}
      onValueChange={handleColorChange}
      defaultFormat="hex"
    >
      <InputGroup>
        <InputGroupAddon>
          <ColorPickerTrigger asChild>
            <ColorPickerSwatch className="-ml-0.5 h-5 w-5 cursor-pointer px-4" />
          </ColorPickerTrigger>
        </InputGroupAddon>

        <InputGroupInput
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          placeholder="#000000"
        />
      </InputGroup>

      <ColorPickerContent>
        <ColorPickerArea />

        <div className="flex items-center gap-2">
          <ColorPickerEyeDropper />
          <ColorPickerHueSlider />
        </div>

        <div className="flex items-center gap-2">
          <ColorPickerFormatSelect />
          <ColorPickerInput />
        </div>
      </ColorPickerContent>
    </ColorPicker>
  );
};
