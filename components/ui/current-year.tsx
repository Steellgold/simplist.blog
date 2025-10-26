"use client"

import { useEffect, useState } from "react"

export const CurrentYear = () => {
  const [year, setYear] = useState<number>()

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  // Fallback for SSR
  if (!year) return "2025"
  return <span>{year}</span>
}