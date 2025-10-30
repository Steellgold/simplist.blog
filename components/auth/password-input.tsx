"use client"

import { Eye, EyeOff, RefreshCcw } from "lucide-react"
import { forwardRef, useState } from "react"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"

interface PasswordInputProps extends React.ComponentPropsWithoutRef<"input"> {
  id?: string
  placeholder?: string;
  showGenerator?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({
  id,
  placeholder = "••••••••",
  showGenerator = false,
  value,
  onChange,
  disabled,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [localValue, setLocalValue] = useState<string>("");

  const currentValue = localValue || value || "";

  const generate = (length: number = 12) => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%^&*()-_=+[]{}|;:,.<>?/";
    const allChars = upper + lower + numbers + special;

    let password = "";
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    setLocalValue(password);

    // Notifier le parent du changement via onChange
    if (onChange) {
      const syntheticEvent = {
        target: { value: password }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }

    setShowPassword(true);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  }
  
  return (
    <InputGroup>
      <InputGroupInput
        id={id}
        ref={ref}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        {...props}
      />

      <InputGroupAddon align="inline-end">
        <InputGroupButton
          onClick={() => setShowPassword(!showPassword)}
          size={"icon-xs"}
          type="button"
          disabled={disabled}
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </InputGroupButton>

        {showGenerator && (
          <InputGroupButton
            onClick={() => generate()}
            size={"icon-xs"}
            type="button"
            disabled={disabled}
          >
            <RefreshCcw />
          </InputGroupButton>
        )}
      </InputGroupAddon>
    </InputGroup>
  )
})

PasswordInput.displayName = "PasswordInput"