import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const NewArticleLoading = () => {
  return (
    <div className="container max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          <Skeleton className="h-8 w-[260px]" />
        </h1>
        <div className="text-muted-foreground mt-2">
          <Skeleton className="h-4 w-[360px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Post Information */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-5 w-[80px]" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-[220px]" />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              {/* Excerpt */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-5 w-[90px]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Toolbar */}
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-8" />
                ))}
              </div>
              {/* Textarea */}
              <Skeleton className="h-[400px] w-full" />
              {/* Stats row */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-14" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Visibility */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-5 w-[100px]" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-[240px]" />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-14" />
              </div>
            </CardContent>
          </Card>

          {/* Post Banner */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-5 w-[110px]" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-[260px]" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-36 w-full" />
                <div className="flex gap-2">
                  <Button disabled variant="outlineDestructive" size="sm" className="flex-1">
                    <Skeleton className="h-4 w-24" />
                  </Button>
                  <Button disabled variant="outline" size="sm" className="flex-1">
                    <Skeleton className="h-4 w-24" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default NewArticleLoading


