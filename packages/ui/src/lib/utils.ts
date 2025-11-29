import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const getInitials = (name: string | null | undefined): string => {
  if (!name) return "?"
  
  const allInitials = name.split(" ").map(n => n[0]).join("").toUpperCase()
  
  const words = name.split(" ")
  if (words.length >= 2) {
    return allInitials.slice(0, 2)
  }

  return name.substring(0, 2).toUpperCase()
}
