import { cn } from "@workspace/ui/lib/utils"

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  animated?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, animated = true, ...props }) => {
  return (
    <div
      className={cn(
        animated ? "animate-pulse" : "",
        "rounded-md bg-primary/10",
        className
      )}
      {...props}
    />
  )
}