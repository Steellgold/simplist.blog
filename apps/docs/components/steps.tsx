"use client"

import { useContext, createContext, useRef, useMemo } from "react"
import type { FC, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@simplist/ui/components/avatar"

type StepProps = {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

type StepsProps = { 
  children: ReactNode
  className?: string 
}

const StepsContext = createContext<{ getStepNumber: () => number } | null>(null)

export const Steps: FC<StepsProps> = ({ children, className }) => {
  const stepCountRef = useRef(0)
  stepCountRef.current = 0

  const contextValue = useMemo(() => ({
    getStepNumber: () => {
      stepCountRef.current += 1
      return stepCountRef.current
    }
  }), [])

  return (
    <StepsContext.Provider value={contextValue}>
      <div className={cn("relative flex flex-col gap-4", className)}>
        {children}
      </div>
    </StepsContext.Provider>
  )
}

export const Step: FC<StepProps> = ({ title, description, children, className }) => {
  const context = useContext(StepsContext)
  const stepNumberRef = useRef<number | null>(null)

  if (stepNumberRef.current === null) {
    stepNumberRef.current = context?.getStepNumber() ?? 1
  }

  const stepNumber = stepNumberRef.current

  return (
    <div className={cn("relative", className)}>
      {/* Mobile */}
      <div className="flex flex-col gap-0 sm:hidden">
        <div className="flex items-center gap-3">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="text-sm">{stepNumber}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold leading-tight">{title}</h3>
          </div>
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground pl-11">{description}</p>
        )}
        
        {children && (
          <div className="w-full overflow-x-auto pt-4">
            {children}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex gap-4">
        <div className="flex flex-col items-center shrink-0">
          <Avatar className="size-8">
            <AvatarFallback className="text-sm">{stepNumber}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1 min-w-0 space-y-1.5">
          <div>
            <h3 className="font-semibold text-base">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          
          {children && (
            <div className="w-full overflow-x-auto">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type StepContentProps = {
  children: ReactNode
  className?: string
}

export const StepContent: FC<StepContentProps> = ({ children, className }) => {
  return <div className={cn("w-full", className)}>{children}</div>
}