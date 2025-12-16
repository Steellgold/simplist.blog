"use client"

import { cn } from "@simplist/ui/lib/utils"
import { animate, motion, useMotionTemplate, useMotionValue } from "motion/react"
import React, { useCallback, useEffect, useRef } from "react"

interface MagicSVGProps {
  children: React.ReactNode
  width: number
  height: number
  className?: string
  gradientSize?: number
  gradientFrom?: string
  gradientTo?: string
  strokeWidth?: number
  fill?: string
  strokeColor?: string
}

export function MagicSVG({
  children,
  width,
  height,
  className,
  gradientSize = 50,
  gradientFrom = "#9E7AFF",
  gradientTo = "#FE8BBB",
  strokeWidth = 1,
  fill = "none",
  strokeColor = "#2C2C2C",
}: MagicSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const animatedX = useMotionValue(-gradientSize * 2)
  const animatedY = useMotionValue(-gradientSize * 2)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (svgRef.current) {
        const { left, top } = svgRef.current.getBoundingClientRect()
        const clientX = e.clientX
        const clientY = e.clientY
        const newX = clientX - left
        const newY = clientY - top

        animate(animatedX, newX, {
          type: "spring",
          stiffness: 150,
          damping: 25,
          mass: 0.8,
        })

        animate(animatedY, newY, {
          type: "spring",
          stiffness: 150,
          damping: 25,
          mass: 0.8,
        })
      }
    },
    [animatedX, animatedY],
  )

  const handleMouseLeave = useCallback(() => {
    animate(animatedX, -gradientSize * 2, {
      type: "spring",
      stiffness: 100,
      damping: 30,
    })

    animate(animatedY, -gradientSize * 2, {
      type: "spring",
      stiffness: 100,
      damping: 30,
    })
  }, [animatedX, animatedY, gradientSize])

  const handleMouseEnter = useCallback(() => {
    document.addEventListener("mousemove", handleMouseMove)
  }, [handleMouseMove])

  useEffect(() => {
    const svgElement = svgRef.current
    if (svgElement) {
      svgElement.addEventListener("mouseenter", handleMouseEnter)
      svgElement.addEventListener("mouseleave", handleMouseLeave)
    }
    return () => {
      if (svgElement) {
        svgElement.removeEventListener("mouseenter", handleMouseEnter)
        svgElement.removeEventListener("mouseleave", handleMouseLeave)
      }
      document.removeEventListener("mousemove", handleMouseMove)
    }
  }, [handleMouseEnter, handleMouseLeave, handleMouseMove])

  useEffect(() => {
    animatedX.set(-gradientSize * 2)
    animatedY.set(-gradientSize * 2)
  }, [gradientSize, animatedX, animatedY])

  const gradientId = "magic-gradient-wordmark"
  const maskId = "magic-mask-wordmark"

  return (
    <motion.svg
      aria-label="Simplist"
      className={cn("cursor-pointer transition-all duration-300", className)}
      fill="none"
      height={height}
      ref={svgRef}
      style={{ maxWidth: "100%", height: "auto" }}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Simplist</title>
      <defs>
        <motion.radialGradient
          cx={useMotionTemplate`${animatedX}px`}
          cy={useMotionTemplate`${animatedY}px`}
          gradientUnits="userSpaceOnUse"
          id={gradientId}
          r={gradientSize}
        >
          <stop offset="0%" stopColor={gradientFrom} />
          <stop offset="70%" stopColor={gradientTo} />
          <stop offset="100%" stopColor="transparent" />
        </motion.radialGradient>

        <mask id={maskId}>
          <rect fill="black" height="100%" width="100%" />
          <motion.circle
            cx={useMotionTemplate`${animatedX}px`}
            cy={useMotionTemplate`${animatedY}px`}
            fill="white"
            r={gradientSize}
          />
        </mask>
      </defs>

      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const childType = (child as React.ReactElement).type
          if (childType === "defs" || childType === "mask" || childType === "clipPath") {
            return child
          }
        }
        return null
      })}

      <g>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            const childType = (child as React.ReactElement).type
            if (childType !== "defs" && childType !== "mask" && childType !== "clipPath") {
              return React.cloneElement(child as React.ReactElement<React.SVGProps<SVGElement>>, {
                stroke: strokeColor,
                strokeWidth,
                fill,
              })
            }
          }
          return null
        })}
      </g>

      <g mask={`url(#${maskId})`}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            const childType = (child as React.ReactElement).type
            if (childType !== "defs" && childType !== "mask" && childType !== "clipPath") {
              return React.cloneElement(child as React.ReactElement<React.SVGProps<SVGElement>>, {
                stroke: `url(#${gradientId})`,
                strokeWidth: strokeWidth + 1,
                fill,
              })
            }
          }
          return null
        })}
      </g>
    </motion.svg>
  )
}