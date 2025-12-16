"use client"

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@simplist/ui/components/input-group"
import { Eye, EyeOff, RefreshCcw } from "lucide-react"
import { FC, forwardRef, useState } from "react"

type UsePasswordInputProps = {
  value?: string | number | readonly string[]
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

const usePasswordInput = ({ value, onChange }: UsePasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [localValue, setLocalValue] = useState<string>("")

  const currentValue = localValue || value || ""

  const toggleVisibility = () => setShowPassword((prev) => !prev)

  const generate = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const lower = "abcdefghijklmnopqrstuvwxyz"
    const numbers = "0123456789"
    const special = "!@#$%^&*()-_=+[]{}|;:,.<>?/"
    const allChars = upper + lower + numbers + special

    let password = ""
    password += upper[Math.floor(Math.random() * upper.length)]
    password += lower[Math.floor(Math.random() * lower.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += special[Math.floor(Math.random() * special.length)]

    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }

    password = password.split("").sort(() => 0.5 - Math.random()).join("")

    setLocalValue(password)

    if (onChange) {
      const syntheticEvent = {
        target: { value: password },
      } as React.ChangeEvent<HTMLInputElement>
      onChange(syntheticEvent)
    }

    setShowPassword(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
    onChange?.(e)
  }

  return {
    showPassword,
    currentValue,
    toggleVisibility,
    generate,
    handleChange,
  }
}

type PasswordInputBaseProps = Omit<React.ComponentPropsWithoutRef<"input">, "type"> & {
  placeholder?: string
  showGenerator?: boolean
}

type PasswordActionsProps = {
  showPassword: boolean
  showGenerator: boolean
  disabled?: boolean
  onToggleVisibility: () => void
  onGenerate: () => void
}

const PasswordActions: FC<PasswordActionsProps> = ({
  showPassword,
  showGenerator,
  disabled,
  onToggleVisibility,
  onGenerate,
}: PasswordActionsProps) => {
  return (
    <InputGroupAddon align="inline-end">
      <InputGroupButton
        onClick={onToggleVisibility}
        size="icon-xs"
        type="button"
        disabled={disabled}
      >
        {showPassword ? <EyeOff /> : <Eye />}
      </InputGroupButton>

      {showGenerator && (
        <InputGroupButton
          onClick={onGenerate}
          size="icon-xs"
          type="button"
          disabled={disabled}
        >
          <RefreshCcw />
        </InputGroupButton>
      )}
    </InputGroupAddon>
  )
}

export const InputGroupPasswordInput = forwardRef<HTMLInputElement, PasswordInputBaseProps>(
  ({ placeholder = "••••••••", showGenerator = false, value, onChange, disabled, ...props }, ref) => {
    const { showPassword, currentValue, toggleVisibility, generate, handleChange } = usePasswordInput({
      value,
      onChange,
    })

    return (
      <>
        <InputGroupInput
          ref={ref}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />

        <PasswordActions
          showPassword={showPassword}
          showGenerator={showGenerator}
          disabled={disabled}
          onToggleVisibility={toggleVisibility}
          onGenerate={generate}
        />
      </>
    )
  }
)

InputGroupPasswordInput.displayName = "InputGroupPasswordInput"

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputBaseProps>((props, ref) => {
  return (
    <InputGroup>
      <InputGroupPasswordInput ref={ref} {...props} />
    </InputGroup>
  )
})

PasswordInput.displayName = "PasswordInput"