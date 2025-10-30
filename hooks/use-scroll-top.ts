"use client"

import { useEffect, useState } from "react"

/**
 * Hook to detect if the user has scrolled past a certain threshold
 * @param threshold - Number of pixels to scroll before returning true (default: 20)
 * @returns boolean - true if scrolled past threshold, false if at top
 */
export const useScrollTop = (threshold = 20): boolean => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsScrolled(scrollY > threshold)
    }

    // Check initial scroll position
    handleScroll()

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Cleanup
    return () => window.removeEventListener("scroll", handleScroll)
  }, [threshold])

  return isScrolled
}
