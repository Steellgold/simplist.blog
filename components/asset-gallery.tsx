"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Copy, FolderIcon, Image as ImageIcon, Trash2, Upload } from "lucide-react"
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

export function AssetGallery({ projectId }: AssetGalleryProps) {
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
  const [search, setSearch] = useState("")

  const loadAssets = async () => {
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
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadAssets()
    }
  }, [isOpen, projectId])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("projectId", projectId)

      // Simulate progress (since we can't track real progress easily with fetch)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/uploads/asset", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      toast.success("Asset uploaded successfully")
      await loadAssets()
      
      // Reset file input
      e.target.value = ""
    } catch (error: any) {
      console.error("Upload error:", error)
      toast.error(error.message || "Failed to upload asset")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return

    try {
      await deleteAsset(assetId)
      toast.success("Asset deleted")
      await loadAssets()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete asset")
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success("URL copied to clipboard")
  }

  const handleInsertMarkdown = (url: string, filename: string) => {
    const markdown = `![${filename}](${url})`
    navigator.clipboard.writeText(markdown)
    toast.success("Markdown copied to clipboard")
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <FolderIcon />
          Asset Gallery
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-6xl h-[85vh] p-0">
        <div className="flex flex-col h-full">
        <DialogHeader>
          <DialogTitle>Asset Gallery</DialogTitle>
          <DialogDescription>
            Upload and manage your project assets. Max file size: 10MB.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6 h-full overflow-hidden">
          <div className="grid h-full gap-6 md:grid-cols-[320px_1fr]">
            {/* Left column */}
            <div className="space-y-4 overflow-y-auto pr-1">
              {/* Storage Info */}
              {storageInfo && (
                <Card>
                  <CardHeader>
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
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="asset-upload"
                      className={`flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        isUploading
                          ? "bg-muted border-muted-foreground/20 cursor-not-allowed"
                          : "bg-muted/50 hover:bg-muted border-muted-foreground/50"
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
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
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
            </div>

            {/* Right column */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center justify-between mb-3 gap-3">
                <div className="text-sm text-muted-foreground">
                  {assets.length} {assets.length === 1 ? "asset" : "assets"}
                </div>
                <div className="w-56">
                  <Input
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Assets Grid */}
              <div className="overflow-y-auto pr-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {assets
                    .filter((a) =>
                      a.originalName.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((asset) => (
              <Card key={asset.id} className="overflow-hidden">
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={asset.url}
                    alt={asset.originalName}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
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
                      onClick={() => handleCopyUrl(asset.url)}
                    >
                      <Copy className="w-3 h-3" />
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => handleInsertMarkdown(asset.url, asset.originalName)}
                    >
                      <ImageIcon className="w-3 h-3" />
                      MD
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => handleDelete(asset.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {assets.length === 0 && !isUploading && (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No assets yet. Upload your first image!</p>
            </div>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

