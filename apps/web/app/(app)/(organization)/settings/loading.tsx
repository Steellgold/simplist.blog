import { Skeleton } from "@workspace/ui/components/skeleton";

const OrganizationSettings = () => {
  return (
    <>
      <div className="flex flex-col space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </>
  )
}

export default OrganizationSettings;