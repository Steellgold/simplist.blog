"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { useProjectContext } from "@/components/projects/context-provider";
import { ArrowsRotateLeft, FileArrowUp, Picture } from "@gravity-ui/icons";
import { MediaType } from "@simplist/db";
import { Button } from "@simplist/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@simplist/ui/components/empty";
import { Kbd } from "@simplist/ui/components/kbd";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import {
  deleteMedia,
  deleteMultipleMedia,
  getProjectMedia,
  getStorageStats,
  type MediaItem,
  type StorageStats,
} from "@/lib/actions/media";
import { useMediaColumns } from "./media-columns";
import { MediaDataTable } from "./media-data-table";
import { MediaUploadDialog } from "./media-upload-dialog";

interface MediaClientPageProps {
  initialMedia: MediaItem[];
  initialTotal: number;
  initialTotalPages: number;
  storageStats: StorageStats;
  memberCount: number;
  project: {
    id: string;
    name: string;
    slug: string;
  };
}

export const MediaClientPage = ({
  initialMedia,
  initialTotal,
  initialTotalPages,
  storageStats: initialStorageStats,
  memberCount,
  project,
}: MediaClientPageProps) => {
  const { currentProject } = useProjectContext();

  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const [filter, setFilter] = useState<MediaType | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [storageStats, setStorageStats] = useState(initialStorageStats);

  // Check if user has pro access
  const isPro = Boolean(
    currentProject?.subscriptionTier === "PRO" &&
    currentProject?.subscriptionExpiresAt &&
    new Date(currentProject.subscriptionExpiresAt) > new Date(),
  );

  // Load media data
  const fetchMedia = useCallback(
    async (page: number = 1, type?: MediaType, search?: string) => {
      setIsLoading(true);
      try {
        const result = await getProjectMedia(project.id, {
          page,
          limit: 24,
          type,
          search: search || undefined,
        });
        setMedia(result.media);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setCurrentPage(page);
      } catch {
        toast.error("Failed to load media");
      } finally {
        setIsLoading(false);
      }
    },
    [project.id],
  );

  const refreshStorageStats = useCallback(async () => {
    try {
      const stats = await getStorageStats(project.id);
      setStorageStats(stats);
    } catch (error) {
      console.error("Failed to refresh storage stats:", error);
    }
  }, [project.id]);

  const handleUploadComplete = useCallback(() => {
    fetchMedia(1, filter, search);
    refreshStorageStats();
    setUploadDialogOpen(false);
  }, [fetchMedia, refreshStorageStats, filter, search]);

  const handleDelete = useCallback(
    async (mediaId: string) => {
      // Calculate new counts before updating state
      const newMediaLength = media.length - 1;
      const newTotal = total - 1;

      // Optimistic update: remove from local state immediately
      setMedia((prev) => prev.filter((m) => m.id !== mediaId));
      setTotal(newTotal);

      const result = await deleteMedia(mediaId);
      if ("error" in result) {
        // Revert on error by refetching
        fetchMedia(currentPage, filter, search);
        throw new Error(result.error);
      }
      refreshStorageStats();

      // If current page is now empty but there are more items, load appropriate page
      if (newMediaLength === 0 && newTotal > 0) {
        if (currentPage > 1) {
          fetchMedia(currentPage - 1, filter, search);
        } else {
          fetchMedia(1, filter, search);
        }
      }
    },
    [
      currentPage,
      filter,
      search,
      fetchMedia,
      refreshStorageStats,
      total,
      media.length,
    ],
  );

  const handleBulkDelete = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;

      // Calculate new counts before updating state
      const idsSet = new Set(ids);
      const deletedCount = ids.length;
      const newMediaLength = media.filter((m) => !idsSet.has(m.id)).length;
      const newTotal = total - deletedCount;

      // Check if we need to load a different page BEFORE updating state
      const shouldLoadDifferentPage = newMediaLength === 0 && newTotal > 0;
      const targetPage = shouldLoadDifferentPage
        ? currentPage > 1
          ? currentPage - 1
          : 1
        : currentPage;

      // Show deleting toast for user feedback
      const toastId = toast.loading(
        `Deleting ${deletedCount} file${deletedCount === 1 ? "" : "s"}...`,
      );

      // Set deleting state to prevent empty state flash
      setIsDeleting(true);

      // Optimistic update: remove from local state immediately
      setMedia((prev) => prev.filter((m) => !idsSet.has(m.id)));
      setTotal(newTotal);

      try {
        const result = await deleteMultipleMedia(ids);
        if ("error" in result) {
          // Update toast to error and revert on error by refetching
          toast.error(result.error || "Failed to delete files", {
            id: toastId,
          });
          fetchMedia(currentPage, filter, search);
          throw new Error(result.error);
        }

        // Update toast to success
        toast.success(
          `${result.deleted} file${result.deleted === 1 ? "" : "s"} deleted`,
          { id: toastId },
        );
        refreshStorageStats();

        // If current page is now empty but there are more items, load appropriate page
        if (shouldLoadDifferentPage) {
          fetchMedia(targetPage, filter, search);
        }
      } catch (error) {
        // Update toast to error and revert on error by refetching
        toast.error(
          error instanceof Error ? error.message : "Failed to delete files",
          { id: toastId },
        );
        fetchMedia(currentPage, filter, search);
        throw error;
      } finally {
        // Clear deleting state
        setIsDeleting(false);
      }
    },
    [
      currentPage,
      filter,
      search,
      fetchMedia,
      refreshStorageStats,
      total,
      media,
      setIsDeleting,
    ],
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearch(query);
      fetchMedia(1, filter, query);
    },
    [fetchMedia, filter],
  );

  const handleFilterChange = useCallback(
    (type: MediaType | undefined) => {
      setFilter(type);
      fetchMedia(1, type, search);
    },
    [fetchMedia, search],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      fetchMedia(page, filter, search);
    },
    [fetchMedia, filter, search],
  );

  // Get columns
  const columns = useMediaColumns({
    onDelete: handleDelete,
    isPro,
    showUploadedBy: memberCount > 1,
    projectId: project.id,
  });

  const isFiltered = filter !== undefined || search !== "";
  if (media.length === 0 && !isLoading && !isDeleting && !isFiltered) {
    return (
      <div className="flex min-h-[calc(90vh-4rem)] items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Picture />
            </EmptyMedia>
            <EmptyTitle>No media yet</EmptyTitle>
            <EmptyDescription>
              Upload images to use in your articles. Drag and drop files or
              click on button below.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <FileArrowUp className="mr-2 h-4 w-4" />
              Upload images
              <Kbd>N</Kbd>
            </Button>
          </EmptyContent>
        </Empty>

        <MediaUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          projectId={project.id}
          onUploadComplete={handleUploadComplete}
        />
      </div>
    );
  }

  return (
    <PageLayout
      title="Media"
      description="Manage images and files for your project"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => fetchMedia(currentPage, filter, search)}
            disabled={isLoading}
          >
            <ArrowsRotateLeft className={isLoading ? "animate-spin" : ""} />
          </Button>

          <Button onClick={() => setUploadDialogOpen(true)}>
            <FileArrowUp />
            Upload
            <Kbd>N</Kbd>
          </Button>
        </div>
      }
    >
      {/* Data table with list/grid toggle */}
      <MediaDataTable
        columns={columns}
        data={media}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        isPro={isPro}
        isLoading={isLoading || isDeleting}
        totalPages={totalPages}
        currentPage={currentPage}
        total={total}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        storageUsed={storageStats.used}
        storageLimit={storageStats.limit}
        storageByType={storageStats.byType}
        projectId={project.id}
      />

      {/* Upload dialog */}
      <MediaUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        projectId={project.id}
        onUploadComplete={handleUploadComplete}
      />
    </PageLayout>
  );
};
