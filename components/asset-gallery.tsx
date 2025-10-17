"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Copy, 
  FolderIcon, 
  Image as ImageIcon, 
  Trash2, 
  Upload, 
  Search,
  Grid3X3,
  List,
  Eye,
  Download,
  Filter,
  SortDesc
} from "lucide-react"
import Image from "next/image"
import { toast } from "@/components/ui/sonner"
import { getProjectAssets, deleteAsset, getProjectStorageInfo } from "@/lib/actions/assets"

type Asset = {
  id: string
  filename: string
  originalName: string
  url: string
  mimeType: string
  size: number
  width: number | null
  height: number | null
  createdAt: Date
}

type AssetGalleryProps = {
  projectId: string
}

type ViewMode = "grid" | "list"
type SortBy = "name" | "date" | "size"
type FilterBy = "all" | "images" | "documents"

export const AssetGallery = ({ projectId }: AssetGalleryProps) => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [storageInfo, setStorageInfo] = useState<{
    used: number
    limit: number
    available: number
    percentage: number
  } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<SortBy>("date")
  const [filterBy, setFilterBy] = useState<FilterBy>("all")
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  const loadAssets = useCallback(async () => {
    setIsLoading(true)
    try {
      const [assetsData, storage] = await Promise.all([
        getProjectAssets(projectId),
        getProjectStorageInfo(projectId),
      ])
      setAssets(assetsData)
      setStorageInfo(storage)
    } catch (error) {
      console.error("Failed to load assets:", error)
      toast.error("Failed to load assets")
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (isOpen) {
      loadAssets()
    }
  }, [isOpen, loadAssets])

  const filteredAndSortedAssets = useMemo(() => {
    let filtered = assets.filter((asset) => {
      const matchesSearch = asset.originalName.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = 
        filterBy === "all" || 
        (filterBy === "images" && asset.mimeType.startsWith("image/")) ||
        (filterBy === "documents" && !asset.mimeType.startsWith("image/"))
      return matchesSearch && matchesFilter
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.originalName.localeCompare(b.originalName)
        case "size":
          return b.size - a.size
        case "date":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return filtered
  }, [assets, search, filterBy, sortBy])

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("projectId", projectId)

      const xhr = new XMLHttpRequest()
      
      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            setUploadProgress(progress)
          }
        })

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error("Upload failed"))
          }
        })

        xhr.addEventListener("error", () => reject(new Error("Upload failed")))
        
        xhr.open("POST", "/api/uploads/asset")
        xhr.send(formData)
      })

      await uploadPromise
      toast.success("Asset uploaded successfully")
      await loadAssets()
      
      e.target.value = ""
    } catch (error: any) {
      console.error("Upload error:", error)
      toast.error(error.message || "Failed to upload asset")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [projectId, loadAssets])

  const handleDelete = useCallback(async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return

    try {
      await deleteAsset(assetId)
      setAssets(prev => prev.filter(asset => asset.id !== assetId))
      toast.success("Asset deleted")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete asset")
    }
  }, [])

  const handleCopyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url)
    toast.success("URL copied to clipboard")
  }, [])

  const handleInsertMarkdown = useCallback((url: string, filename: string) => {
    const markdown = `![${filename}](${url})`
    navigator.clipboard.writeText(markdown)
    toast.success("Markdown copied to clipboard")
  }, [])

  const handleDownload = useCallback((url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <FolderIcon />
            Asset Gallery
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[98vw] max-w-[1600px] h-[95vh] p-0">
          <div className="flex flex-col h-full">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle className="flex items-center gap-2">
                <FolderIcon className="w-5 h-5" />
                Asset Gallery
                <Badge variant="secondary" className="ml-2">
                  {filteredAndSortedAssets.length}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Upload and manage your project assets. Max file size: 10MB.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-hidden">
              <div className="grid h-full grid-cols-1 lg:grid-cols-[350px_1fr]">
                {/* Sidebar */}
                <div className="border-r bg-muted/30">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      {/* Storage Info */}
                      {storageInfo && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Storage Usage</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <Progress value={storageInfo.percentage} />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>
                                {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.limit)}
                              </span>
                              <span>{storageInfo.percentage.toFixed(1)}%</span>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Upload Section */}
                      <Card>
                        <CardContent className="p-4">
                          <label
                            htmlFor="asset-upload"
                            className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                              isUploading
                                ? "bg-muted border-muted-foreground/20 cursor-not-allowed"
                                : "bg-background hover:bg-muted/50 border-muted-foreground/50"
                            }`}
                          >
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {isUploading ? "Uploading..." : "Click to upload"}
                            </p>
                            <input
                              id="asset-upload"
                              type="file"
                              className="hidden"
                              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                              onChange={handleUpload}
                              disabled={isUploading}
                            />
                          </label>
                          {isUploading && (
                            <div className="mt-4">
                              <Progress value={uploadProgress} />
                              <p className="text-xs text-muted-foreground text-center mt-2">
                                {uploadProgress}%
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Filters */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Type</label>
                            <div className="flex gap-1 mt-1">
                              {(["all", "images", "documents"] as FilterBy[]).map((filter) => (
                                <Button
                                  key={filter}
                                  variant={filterBy === filter ? "default" : "outline"}
                                  size="sm"
                                  className="h-7 text-xs capitalize"
                                  onClick={() => setFilterBy(filter)}
                                >
                                  {filter}
                                </Button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Sort by</label>
                            <div className="flex gap-1 mt-1">
                              {(["date", "name", "size"] as SortBy[]).map((sort) => (
                                <Button
                                  key={sort}
                                  variant={sortBy === sort ? "default" : "outline"}
                                  size="sm"
                                  className="h-7 text-xs capitalize"
                                  onClick={() => setSortBy(sort)}
                                >
                                  {sort}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </div>

                {/* Main Content */}
                <div className="flex flex-col">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between p-4 border-b bg-background">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search assets..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-10 w-80"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Assets Display */}
                  <ScrollArea className="flex-1">
                    <div className="p-4">
                      {isLoading ? (
                        <div className={viewMode === "grid" 
                          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4"
                          : "space-y-2"
                        }>
                          {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                              <Skeleton className={viewMode === "grid" ? "aspect-square w-full" : "h-16 w-full"} />
                              {viewMode === "grid" && <Skeleton className="h-4 w-full" />}
                            </div>
                          ))}
                        </div>
                      ) : filteredAndSortedAssets.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">No assets found</p>
                          <p>
                            {assets.length === 0 
                              ? "Upload your first asset to get started!" 
                              : "Try adjusting your search or filters."
                            }
                          </p>
                        </div>
                      ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                          {filteredAndSortedAssets.map((asset) => (
                            <Card key={asset.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                              <div 
                                className="relative aspect-square bg-muted cursor-pointer"
                                onClick={() => setSelectedAsset(asset)}
                              >
                                {asset.mimeType.startsWith("image/") ? (
                                  <Image
                                    src={asset.url}
                                    alt={asset.originalName}
                                    fill
                                    className="object-cover"
                                    sizes="300px"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                      <p className="text-xs text-muted-foreground font-medium">
                                        {asset.mimeType.split('/')[1]?.toUpperCase()}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="w-6 h-6 text-white" />
                                </div>
                              </div>
                              <CardContent className="p-3 space-y-2">
                                <p className="text-xs font-medium truncate" title={asset.originalName}>
                                  {asset.originalName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatBytes(asset.size)}
                                  {asset.width && asset.height && ` • ${asset.width}×${asset.height}`}
                                </p>
                                <div className="flex gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-7 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCopyUrl(asset.url)
                                    }}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-7 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleInsertMarkdown(asset.url, asset.originalName)
                                    }}
                                  >
                                    <ImageIcon className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDownload(asset.url, asset.originalName)
                                    }}
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDelete(asset.id)
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredAndSortedAssets.map((asset) => (
                            <Card key={asset.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                  onClick={() => setSelectedAsset(asset)}>
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-muted rounded flex-shrink-0 relative">
                                  {asset.mimeType.startsWith("image/") ? (
                                    <Image
                                      src={asset.url}
                                      alt={asset.originalName}
                                      fill
                                      className="object-cover rounded"
                                      sizes="64px"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full">
                                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{asset.originalName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatBytes(asset.size)}
                                    {asset.width && asset.height && ` • ${asset.width}×${asset.height}`}
                                    {" • "}
                                    {new Date(asset.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCopyUrl(asset.url)
                                    }}
                                  >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy URL
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDownload(asset.url, asset.originalName)
                                    }}
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDelete(asset.id)
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Asset Preview Dialog */}
      {selectedAsset && (
        <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="max-w-4xl h-[90vh] p-0">
            <div className="flex flex-col h-full">
              <DialogHeader className="p-6 border-b">
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  {selectedAsset.originalName}
                </DialogTitle>
                <DialogDescription>
                  {formatBytes(selectedAsset.size)}
                  {selectedAsset.width && selectedAsset.height && 
                    ` • ${selectedAsset.width}×${selectedAsset.height}`
                  }
                  {" • "}
                  {new Date(selectedAsset.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex-1 flex items-center justify-center p-6 bg-muted/30">
                {selectedAsset.mimeType.startsWith("image/") ? (
                  <div className="relative max-w-full max-h-full">
                    <Image
                      src={selectedAsset.url}
                      alt={selectedAsset.originalName}
                      width={selectedAsset.width || 800}
                      height={selectedAsset.height || 600}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-20 h-20 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium">{selectedAsset.mimeType}</p>
                    <p className="text-muted-foreground">Preview not available</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between p-6 border-t bg-background">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleCopyUrl(selectedAsset.url)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleInsertMarkdown(selectedAsset.url, selectedAsset.originalName)}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Copy Markdown
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(selectedAsset.url, selectedAsset.originalName)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedAsset.id)
                    setSelectedAsset(null)
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

