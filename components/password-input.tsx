"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./ui/input-group"

interface PasswordInputProps {
  id: string
  placeholder?: string
  required?: boolean
}

export function PasswordInput({ id, placeholder = "••••••••", required = false }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <InputGroup>
      <InputGroupInput
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        required={required}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton onClick={() => setShowPassword(!showPassword)} size={"icon-xs"}>
          {showPassword ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
