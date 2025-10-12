"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./ui/input-group"

interface PasswordInputProps {
  id: string
  placeholder?: string
  required?: boolean
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function PasswordInput({
  id,
  placeholder = "••••••••",
  required = false,
  value,
  onChange
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <InputGroup>
      <InputGroupInput
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton onClick={() => setShowPassword(!showPassword)} size={"icon-xs"}>
          {showPassword ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
