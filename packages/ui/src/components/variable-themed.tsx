// Fonction qui récupère le  thème, et renvoi une variable CSS qui correspond au thème

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

type VariableThemedProps = {
  light: string
  dark: string
}

export const useVariableThemed = ({ light, dark }: VariableThemedProps) => {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return dark;

  const currentTheme = resolvedTheme || theme
  const isDark = currentTheme === "dark"

  return isDark ? dark : light
}