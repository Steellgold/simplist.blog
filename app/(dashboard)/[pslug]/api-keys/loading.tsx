import { Skeleton } from "@/components/ui/skeleton"

const ApiKeysLoading = () => {
  return (
    <div className="container max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-32" /> {/* Title */}
          <Skeleton className="h-5 w-96" /> {/* Description */}
        </div>
        <Skeleton className="h-10 w-40" /> {/* Create button */}
      </div>

      {/* Search bar */}
      <Skeleton className="h-10 w-80" />

      {/* Data table */}
      <div className="rounded-md border">
        <div className="border-b">
          {/* Table header */}
          <div className="flex items-center gap-4 p-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20 ml-auto" />
          </div>
        </div>

        {/* Table rows */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-8 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ApiKeysLoading
