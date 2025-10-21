import { ReactNode } from "react"

type PageHeaderProps = {
  title: string
  description?: string
  children?: ReactNode
  actions?: ReactNode
}

export const PageHeader = ({ title, description, children, actions }: PageHeaderProps) => {
  return (
    <div className="flex flex-col gap-6 container max-w-7xl mx-auto">
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