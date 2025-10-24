import { cn } from "@/lib/utils"
import { ReactNode } from "react"

type PageLayoutProps = {
  title: string
  description?: string
  children?: ReactNode
  actions?: ReactNode
  centered?: boolean
}

export const PageLayout = ({ title, description, children, actions, centered = false }: PageLayoutProps) => {
  return (
    <div className={cn("flex flex-col gap-6 container mx-auto", {
      "max-w-7xl": !centered,
      "max-w-3xl": centered,
    })}>
      <div className={actions ? "flex items-center justify-between" : ""}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </div>
  )
}