"use client";

import { useArticleImage } from "@/hooks/use-article-image";
import { useAutoSave } from "@/hooks/use-auto-save";
import {
  EditorFullscreenProvider,
  useEditorFullscreenState,
} from "@/hooks/use-editor-fullscreen";
import { useProject } from "@/hooks/use-project-context";
import { type ArticleVariant } from "@/hooks/use-variant-operations";
import {
  removeArticleCoverImage,
  updateArticle,
  updateArticleCoverImage,
} from "@/lib/actions/articles";
import { createTag, updateTagAppearance } from "@/lib/actions/tags";
import { type ProjectSubscription } from "@/lib/subscription/quota-check";
import {
  type ArticleFormStatus,
  type ArticleWithVariantsAndTags,
} from "@/lib/types/articles";
import { type LanguageCode, getLanguageName } from "@/lib/types/languages";
import { uploadBannerWithProgress } from "@/lib/uploads/banner";
import { type Tag } from "@simplist/db";
import { toast } from "@simplist/ui/components/sonner";
import { cn } from "@simplist/ui/lib/utils";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { ArticleFormLayout } from "./article-form-layout";
import { ArticleBannerUpload } from "./banner-upload";
import { ArticleContentEditor } from "./content-editor";
import { DeleteArticleButton } from "./delete-article-button";
import { ArticleInfoFields } from "./info-fields";
import { ArticleTagsCard } from "./tags-card";
import { VariantCard } from "./variant-card";
import { ArticleVisibilityCard } from "./visibility-card";

type EditArticleFormProps = {
  article: ArticleWithVariantsAndTags;
  availableTags: Tag[];
  subscription?: ProjectSubscription;
  title: string;
  description?: string;
};

export const EditArticleForm: FC<EditArticleFormProps> = ({
  article,
  availableTags: initialAvailableTags,
  subscription,
  title: pageTitle,
  description: pageDescription,
}) => {
  const router = useRouter();
  const { currentProject } = useProject();
  const { isFullscreen, providerValue } = useEditorFullscreenState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<Set<LanguageCode>>(
    new Set(),
  );
  const [availableTags] = useState<Tag[]>(initialAvailableTags);

  // Determine if slug should be regenerated on submit
  // True if the slug is "untitled-draft" or "untitled-draft-X"
  const [shouldRegenerateSlug, setShouldRegenerateSlug] = useState(() => {
    return /^untitled-draft(-\d+)?$/.test(article.slug);
  });

  // Default language from project or fallback to English
  const defaultLanguage: LanguageCode =
    (article.project.defaultLanguage as LanguageCode) ||
    (currentProject?.defaultLanguage as LanguageCode) ||
    "en";

  // Initialize variants with main article data and existing variants
  const initializeVariants = (): ArticleVariant[] => {
    const variants: ArticleVariant[] = [];

    // Add main article as default language variant
    variants.push({
      lang: defaultLanguage,
      title: article.title,
      excerpt: article.excerpt || "",
      content: article.content,
      coverImage: article.coverImage || undefined,
    });

    // Add existing variants (if any)
    if (article.variants) {
      article.variants.forEach((variant) => {
        if (variant.lang !== defaultLanguage) {
          variants.push({
            lang: variant.lang as LanguageCode,
            title: variant.title,
            excerpt: variant.excerpt || "",
            content: variant.content,
            coverImage: variant.coverImage || undefined,
          });
        }
      });
    }

    return variants;
  };

  // Form state
  const [title, setTitle] = useState(article.title);
  const [excerpt, setExcerpt] = useState(article.excerpt || "");
  const [content, setContent] = useState(article.content);
  const [status, setStatus] = useState<ArticleFormStatus>(
    article.status as ArticleFormStatus,
  );
  const [scheduledPublishAt, setScheduledPublishAt] = useState<Date | null>(
    article.scheduledPublishAt ? new Date(article.scheduledPublishAt) : null,
  );

  // Initialize tags by matching article tag names with available tags
  const [tags, setTags] = useState<Tag[]>(() => {
    if (!article.tags || article.tags.length === 0) return [];

    // Match article tags with available tags to get full Tag objects
    return article.tags
      .map((articleTag) =>
        initialAvailableTags.find((t) => t.name === articleTag.name),
      )
      .filter((tag): tag is Tag => tag !== undefined);
  });

  // Variants state
  const [variants, setVariants] =
    useState<ArticleVariant[]>(initializeVariants());
  const [activeVariant, setActiveVariant] =
    useState<LanguageCode>(defaultLanguage);

  // Update variant when form fields change
  const updateActiveVariant = useCallback(
    (updates: Partial<ArticleVariant>) => {
      setVariants((prev) =>
        prev.map((variant) =>
          variant.lang === activeVariant ? { ...variant, ...updates } : variant,
        ),
      );
    },
    [activeVariant],
  );

  // Image management hook
  const {
    imagePreview,
    setImagePreview,
    imageFiles,
    isBannerUploading,
    setIsBannerUploading,
    bannerUploadProgress,
    setBannerUploadProgress,
    handlePickedImage,
    handleImageSelect: baseHandleImageSelect,
    handleRemoveImage: baseHandleRemoveImage,
    resetUploadState,
  } = useArticleImage({
    activeVariant,
    updateActiveVariant,
  });

  // Extended handleImageSelect to also clear from imagesToDelete
  const handleImageSelect = useCallback(
    (url: string) => {
      setImagesToDelete((prev) => {
        const next = new Set(prev);
        next.delete(activeVariant);
        return next;
      });
      baseHandleImageSelect(url);
    },
    [activeVariant, baseHandleImageSelect],
  );

  // Extended handleRemoveImage to also mark for deletion
  const handleRemoveImage = useCallback(() => {
    const currentVariant = variants.find((v) => v.lang === activeVariant);
    const hasNewImageFile = imageFiles.has(activeVariant);
    const hasServerImage = currentVariant?.coverImage && !hasNewImageFile;

    // Mark server image for deletion on submit (not immediate)
    if (hasServerImage) {
      setImagesToDelete((prev) => new Set(prev).add(activeVariant));
    }

    baseHandleRemoveImage();
  }, [activeVariant, variants, imageFiles, baseHandleRemoveImage]);

  // Sync form fields with active variant when switching variants
  // Only trigger on activeVariant change, not on variants change
  useEffect(() => {
    const currentVariant = variants.find((v) => v.lang === activeVariant);
    if (currentVariant) {
      setTitle(currentVariant.title);
      setExcerpt(currentVariant.excerpt);
      setContent(currentVariant.content);
      setImagePreview(currentVariant.coverImage || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVariant]);

  // Auto-save functionality (only for drafts)
  const autoSaveData = useMemo(
    () => ({
      title,
      excerpt,
      content,
      variants: variants.map((v) => ({
        lang: v.lang,
        title: v.title,
        excerpt: v.excerpt,
        content: v.content,
      })),
    }),
    [title, excerpt, content, variants],
  );

  const { status: autoSaveStatus, lastSaved } = useAutoSave(
    autoSaveData,
    async (data) => {
      if (!currentProject?.id) return;

      // Get default language variant for main article
      const defaultVariant = data.variants.find(
        (v) => v.lang === defaultLanguage,
      );
      if (!defaultVariant) return;

      // Prepare variants (exclude default language)
      const articleVariants = data.variants
        .filter((v) => v.lang !== defaultLanguage)
        .map((v) => ({
          lang: v.lang,
          title: v.title,
          excerpt: v.excerpt,
          content: v.content,
        }));

      // Auto-save with draft status
      await updateArticle(
        article.id,
        {
          title: defaultVariant.title,
          excerpt: defaultVariant.excerpt,
          content: defaultVariant.content,
          status: "draft", // Always save as draft for auto-save
          shouldRegenerateSlug: false,
          variants: articleVariants.length > 0 ? articleVariants : undefined,
        },
        currentProject.id,
      );
    },
    {
      delay: 2000,
      // Only auto-save drafts if title and excerpt are not empty and status is draft
      enabled: status === "draft" && title.length > 0 && excerpt.length > 0,
    },
  );

  // Show error toast if auto-save fails
  useEffect(() => {
    if (autoSaveStatus === "error") {
      toast.error(
        "Error auto-saving. Your changes are temporary. Please check your connection.",
      );
    }
  }, [autoSaveStatus]);

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Client-side validation for scheduled articles
    if (status === "scheduled") {
      if (!scheduledPublishAt) {
        toast.error("Please select a date and time for scheduled publication");
        setIsSubmitting(false);
        return;
      }

      if (scheduledPublishAt <= new Date()) {
        toast.error("Scheduled publish date must be in the future");
        setIsSubmitting(false);
        return;
      }
    }

    const toastId = toast.loading("Updating article...");

    try {
      // Step 1: Update article
      toast.loading("Updating article content and metadata...", {
        id: toastId,
      });

      // Get default language variant for main article
      const defaultVariant = variants.find((v) => v.lang === defaultLanguage);
      if (!defaultVariant) {
        throw new Error("Default language variant not found");
      }

      // Prepare variants (exclude default language as it goes to main article)
      // Only include coverImage if it's a URL from library (not a data URL) and no file pending
      const articleVariants = variants
        .filter((v) => v.lang !== defaultLanguage)
        .map((v) => ({
          lang: v.lang,
          title: v.title,
          excerpt: v.excerpt,
          content: v.content,
          coverImage:
            v.coverImage?.startsWith("http") && !imageFiles.has(v.lang)
              ? v.coverImage
              : undefined,
        }));

      // Process tags (create new ones and update appearances)
      const tagIds: string[] = [];
      if (tags.length > 0) {
        toast.loading("Processing tags...", { id: toastId });

        for (const tag of tags) {
          // Check if tag exists in availableTags
          const existingTag = availableTags.find((t) => t.name === tag.name);

          if (existingTag) {
            // Tag exists - check if appearance changed
            if (
              tag.icon !== existingTag.icon ||
              tag.color !== existingTag.color
            ) {
              // Update tag appearance
              await updateTagAppearance(
                tag.name,
                article.projectId,
                (tag.icon || "tag") as any,
                tag.color as any,
              );
            }
            tagIds.push(existingTag.id);
          } else {
            // New tag - create it
            const result = await createTag(article.projectId, {
              name: tag.name,
              icon: (tag.icon || "tag") as any,
              color: tag.color as any,
            });
            if (result.success && result.tag) {
              tagIds.push(result.tag.id);
            }
          }
        }
      }

      toast.loading("Updating article...", { id: toastId });

      // Determine if we should update coverImage directly (from library selection)
      // Only pass coverImage if it's a URL (not a data URL from file upload) and no file is pending
      const shouldUpdateCoverImage =
        defaultVariant.coverImage?.startsWith("http") &&
        !imageFiles.has(defaultLanguage);

      if (!currentProject?.id) {
        toast.error("Project not found", { id: toastId });
        return;
      }

      await updateArticle(
        article.id,
        {
          title: defaultVariant.title,
          excerpt: defaultVariant.excerpt,
          content: defaultVariant.content,
          status,
          shouldRegenerateSlug,
          coverImage: shouldUpdateCoverImage
            ? defaultVariant.coverImage
            : undefined,
          scheduledPublishAt:
            status === "scheduled" ? scheduledPublishAt : null,
          variants: articleVariants,
          tags: tagIds.length > 0 ? tagIds : undefined,
        },
        currentProject.id,
      );

      // Step 2: Delete marked images from server and R2
      if (imagesToDelete.size > 0) {
        const totalDeletes = imagesToDelete.size;
        let deletedCount = 0;

        for (const lang of imagesToDelete) {
          deletedCount++;
          toast.loading(
            `Deleting cover image ${deletedCount}/${totalDeletes}...`,
            { id: toastId },
          );

          try {
            await removeArticleCoverImage(article.id, lang);
          } catch (error) {
            console.error(`Failed to delete image for ${lang}:`, error);
            // Continue with other deletions even if one fails
          }
        }
      }

      // Step 3: Upload all new images if provided
      if (imageFiles.size > 0) {
        const totalImages = imageFiles.size;
        let uploadedCount = 0;

        for (const [lang, file] of imageFiles.entries()) {
          uploadedCount++;
          toast.loading(
            `Uploading cover image ${uploadedCount}/${totalImages}...`,
            { id: toastId },
          );

          setIsBannerUploading(true);
          setBannerUploadProgress(0);

          const data = await uploadBannerWithProgress({
            file,
            projectId: article.projectId,
            postId: article.id,
            onProgress: setBannerUploadProgress,
          });

          setIsBannerUploading(false);
          setBannerUploadProgress(0);

          await updateArticleCoverImage({
            articleId: article.id,
            objectKey: data.key,
            variantLang: lang,
          });
        }
      }

      // Step 4: Success
      toast.success("Article updated successfully!", { id: toastId });

      router.push(`/${currentProject?.slug}/articles`);
      router.refresh();
    } catch (error) {
      console.error("Error updating article:", error);
      toast.error("Failed to update article. Please try again.", {
        id: toastId,
      });
      setIsSubmitting(false);
      resetUploadState();
    }
  };

  return (
    <EditorFullscreenProvider value={providerValue}>
      <ArticleFormLayout title={pageTitle} description={pageDescription}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className={cn(
              "grid grid-cols-1 gap-4 lg:grid-cols-3",
              isFullscreen && "lg:grid-cols-1",
            )}
          >
            <div
              className={cn(
                "space-y-4 lg:col-span-2",
                isFullscreen && "lg:col-span-1",
              )}
            >
              {!isFullscreen && (
                <ArticleInfoFields
                  title={title}
                  excerpt={excerpt}
                  onTitleChange={(newTitle) => {
                    setTitle(newTitle);
                    updateActiveVariant({ title: newTitle });
                  }}
                  onExcerptChange={(newExcerpt) => {
                    setExcerpt(newExcerpt);
                    updateActiveVariant({ excerpt: newExcerpt });
                  }}
                  showSlugControl={
                    !/^untitled-draft(-\d+)?$/.test(article.slug)
                  }
                  shouldRegenerateSlug={shouldRegenerateSlug}
                  onSlugRegenerateChange={setShouldRegenerateSlug}
                  currentSlug={article.slug}
                />
              )}

              <ArticleContentEditor
                content={content}
                onContentChange={(newContent) => {
                  setContent(newContent);
                  updateActiveVariant({ content: newContent });
                }}
                textareaId="content"
                placeholder="Write your article content..."
                projectId={article.projectId}
              />
            </div>

            {!isFullscreen && (
              <div className="space-y-4 lg:col-span-1">
                <ArticleVisibilityCard
                  status={status}
                  onStatusChange={(v) => setStatus(v)}
                  isSubmitting={isSubmitting}
                  submitLabel="Update"
                  leftAction={
                    currentProject && (
                      <DeleteArticleButton
                        articleId={article.id}
                        articleTitle={article.title}
                        projectSlug={currentProject.slug}
                      />
                    )
                  }
                  scheduledPublishAt={scheduledPublishAt}
                  onScheduleChange={setScheduledPublishAt}
                  projectTimezone="UTC"
                  projectDefaultLanguage={defaultLanguage}
                  projectId={currentProject?.id}
                  autoSaveStatus={autoSaveStatus}
                  lastAutoSave={lastSaved}
                />

                <ArticleBannerUpload
                  projectId={article.projectId}
                  imagePreview={imagePreview}
                  onImageChange={handlePickedImage}
                  onImageSelect={handleImageSelect}
                  onRemoveImage={handleRemoveImage}
                  isUploading={isBannerUploading}
                  uploadProgress={bannerUploadProgress}
                  uploadLabel={
                    activeVariant === defaultLanguage
                      ? "Change Image"
                      : `Change Image for ${getLanguageName(activeVariant)}`
                  }
                  emptyDescription={
                    activeVariant === defaultLanguage
                      ? "Update the article cover image."
                      : `Upload a specific image for ${getLanguageName(activeVariant)} variant. Each variant can have its own image.`
                  }
                />

                <ArticleTagsCard
                  tags={tags}
                  availableTags={availableTags}
                  onTagsChange={setTags}
                  onCreateTag={async (name) => {
                    const tempTag: Tag = {
                      id: `temp-${Date.now()}`,
                      name,
                      slug: null,
                      description: null,
                      icon: "tag",
                      color: null,
                      projectId: article.projectId,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    };
                    return tempTag;
                  }}
                />

                <VariantCard
                  defaultLanguage={defaultLanguage}
                  variants={variants}
                  onVariantsUpdate={setVariants}
                  onVariantSelect={setActiveVariant}
                  activeVariant={activeVariant}
                  disabled={isSubmitting}
                  subscription={subscription}
                />
              </div>
            )}
          </div>
        </form>
      </ArticleFormLayout>
    </EditorFullscreenProvider>
  );
};
