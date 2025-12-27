"use client";

import type { FormEvent } from "react";
import { useArticleImage } from "@/hooks/use-article-image";
import {
  EditorFullscreenProvider,
  useEditorFullscreenState,
} from "@/hooks/use-editor-fullscreen";
import { useProject } from "@/hooks/use-project-context";
import { type ArticleVariant } from "@/hooks/use-variant-operations";
import { createArticle, updateArticleCoverImage } from "@/lib/actions/articles";
import { createTag, updateTagAppearance } from "@/lib/actions/tags";
import { type ProjectSubscription } from "@/lib/subscription/quota-check";
import { type ArticleFormStatus } from "@/lib/types/articles";
import { type LanguageCode, getLanguageName } from "@/lib/types/languages";
import { uploadBannerWithProgress } from "@/lib/uploads/banner";
import { Xmark } from "@gravity-ui/icons";
import { type Tag } from "@simplist/db";
import { buttonVariants } from "@simplist/ui/components/button";
import { toast } from "@simplist/ui/components/sonner";
import { cn } from "@simplist/ui/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useCallback, useEffect, useState } from "react";
import { ArticleFormLayout } from "./article-form-layout";
import { ArticleBannerUpload } from "./banner-upload";
import { ArticleContentEditor } from "./content-editor";
import { ArticleInfoFields } from "./info-fields";
import { ArticleTagsCard } from "./tags-card";
import { VariantCard } from "./variant-card";
import { ArticleVisibilityCard } from "./visibility-card";

type CreateArticleFormProps = {
  projectId: string;
  availableTags: Tag[];
  subscription?: ProjectSubscription;
  title: string;
  description?: string;
};

export const CreateArticleForm: FC<CreateArticleFormProps> = ({
  projectId,
  availableTags: initialAvailableTags,
  subscription,
  title: pageTitle,
  description: pageDescription,
}) => {
  const router = useRouter();
  const { currentProject } = useProject();
  const { isFullscreen, providerValue } = useEditorFullscreenState();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default language from project or fallback to English
  const defaultLanguage: LanguageCode =
    (currentProject?.defaultLanguage as LanguageCode) || "en";

  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<ArticleFormStatus>("draft");
  const [scheduledPublishAt, setScheduledPublishAt] = useState<Date | null>(
    null,
  );
  const [tags, setTags] = useState<Tag[]>([]);
  const [availableTags] = useState<Tag[]>(initialAvailableTags);

  // Variants state
  const [variants, setVariants] = useState<ArticleVariant[]>([
    { lang: defaultLanguage, title: "", excerpt: "", content: "" },
  ]);
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
    handleImageSelect,
    handleRemoveImage,
    resetUploadState,
  } = useArticleImage({
    activeVariant,
    updateActiveVariant,
  });

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

    const toastId = toast.loading("Creating article...");

    try {
      // Step 1: Create article
      toast.loading("Generating slug and calculating stats...", {
        id: toastId,
      });

      // Get default language variant for main article
      const defaultVariant = variants.find((v) => v.lang === defaultLanguage);
      if (!defaultVariant) {
        throw new Error("Default language variant not found");
      }

      // Prepare variants (exclude default language as it goes to main article)
      // Only include coverImage if it's a URL from library (not a data URL)
      const articleVariants = variants
        .filter((v) => v.lang !== defaultLanguage)
        .map((v) => ({
          lang: v.lang,
          title: v.title,
          excerpt: v.excerpt,
          content: v.content,
          coverImage: v.coverImage?.startsWith("http")
            ? v.coverImage
            : undefined,
        }));

      // Step 1a: Create new tags and get their IDs
      const tagIds: string[] = [];
      if (tags.length > 0) {
        toast.loading("Processing tags...", { id: toastId });

        for (const tag of tags) {
          // Check if tag exists in availableTags
          const existingTag = initialAvailableTags.find(
            (t) => t.name === tag.name,
          );

          if (existingTag) {
            // Tag exists - check if appearance changed
            if (
              tag.icon !== existingTag.icon ||
              tag.color !== existingTag.color
            ) {
              // Update tag appearance
              await updateTagAppearance(
                tag.name,
                projectId,
                (tag.icon || "tag") as any,
                tag.color as any,
              );
            }
            tagIds.push(existingTag.id);
          } else {
            // New tag - create it
            const result = await createTag(projectId, {
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

      // Step 1b: Create article
      toast.loading("Creating article...", { id: toastId });

      // Only pass coverImage if it's a URL from the library (not a data URL from file picker)
      const coverImageFromLibrary = defaultVariant.coverImage?.startsWith(
        "http",
      )
        ? defaultVariant.coverImage
        : undefined;

      const article = await createArticle({
        title: defaultVariant.title,
        excerpt: defaultVariant.excerpt,
        content: defaultVariant.content,
        status,
        coverImage: coverImageFromLibrary,
        scheduledPublishAt:
          status === "scheduled" ? scheduledPublishAt || undefined : undefined,
        projectId,
        variants: articleVariants.length > 0 ? articleVariants : undefined,
        tags: tagIds.length > 0 ? tagIds : undefined,
      });

      // Step 2: Upload all images if provided
      if (imageFiles.size > 0 && article) {
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

      // Step 3: Success
      toast.success("Article created successfully!", { id: toastId });

      router.push(`/${currentProject?.slug}/articles`);
      router.refresh();
    } catch (error) {
      console.error("Error creating article:", error);
      toast.error("Failed to create article. Please try again.", {
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
                  projectId={projectId}
                  articleContent={content}
                  subscription={subscription}
                  activeVariant={activeVariant}
                  defaultLanguage={defaultLanguage}
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
                projectId={projectId}
              />
            </div>

            {!isFullscreen && (
              <div className="space-y-4 lg:col-span-1">
                <ArticleVisibilityCard
                  status={status}
                  onStatusChange={(v) => setStatus(v)}
                  isSubmitting={isSubmitting}
                  submitLabel="Publish"
                  scheduledPublishAt={scheduledPublishAt}
                  onScheduleChange={setScheduledPublishAt}
                  projectTimezone="UTC"
                  projectDefaultLanguage={defaultLanguage}
                  projectId={currentProject?.id}
                  leftAction={
                    <Link
                      href={`/${currentProject?.slug}/articles`}
                      className={buttonVariants({
                        variant: "outline-destructive",
                        size: "sm",
                      })}
                    >
                      <Xmark />
                      Cancel
                    </Link>
                  }
                />

                <ArticleBannerUpload
                  projectId={projectId}
                  imagePreview={imagePreview}
                  onImageChange={handlePickedImage}
                  onImageSelect={handleImageSelect}
                  onRemoveImage={handleRemoveImage}
                  isUploading={isBannerUploading}
                  uploadProgress={bannerUploadProgress}
                  uploadLabel={
                    activeVariant === defaultLanguage
                      ? "Upload Image"
                      : `Upload Image for ${getLanguageName(activeVariant)}`
                  }
                  emptyDescription={
                    activeVariant === defaultLanguage
                      ? "On the response API it will return the URL of the image."
                      : `Upload a specific image for ${getLanguageName(activeVariant)} variant. Each variant can have its own image.`
                  }
                />

                <ArticleTagsCard
                  tags={tags}
                  availableTags={availableTags}
                  onTagsChange={setTags}
                  onCreateTag={async (name) => {
                    // Create temporary local tag (will be saved on article submit)
                    const tempTag: Tag = {
                      id: `temp-${Date.now()}`, // Temporary ID
                      name,
                      slug: null,
                      description: null,
                      icon: "tag",
                      color: null,
                      projectId,
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
