"use client";

import { useProject } from "@/hooks/use-project-context";
import { type ArticleVariant } from "@/hooks/use-variant-operations";
import { removeArticleCoverImage, updateArticle, updateArticleCoverImage } from "@/lib/actions/articles";
import { type LanguageCode, getLanguageName } from "@/lib/types/languages";
import { buttonVariants } from "@simplist/ui/components/button";
import { toast } from "@simplist/ui/components/sonner";
import { X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArticleBannerUpload } from "./banner-upload";
import { ArticleContentEditor } from "./content-editor";
import { ArticleInfoFields } from "./info-fields";
import { VariantCard } from "./variant-card";
import { ArticleVisibilityCard } from "./visibility-card";

type ArticleStatus = "draft" | "published" | "scheduled";

type Article = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  status: string;
  coverImage: string | null;
  projectId: string;
  scheduledPublishAt?: Date | null;
  variants?: Array<{
    id: string;
    lang: string;
    title: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
  }>;
  project: {
    defaultLanguage?: string;
  };
};

type EditArticleFormProps = {
  article: Article;
};

export const EditArticleForm = ({ article }: EditArticleFormProps) => {
  const router = useRouter();
  const { currentProject } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<Set<LanguageCode>>(new Set());

  // Default language from project or fallback to English
  const defaultLanguage: LanguageCode = (article.project.defaultLanguage as LanguageCode) || (currentProject?.defaultLanguage as LanguageCode) || "en";

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
      article.variants.forEach(variant => {
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
  const [status, setStatus] = useState<ArticleStatus>(article.status as ArticleStatus);
  const [scheduledPublishAt, setScheduledPublishAt] = useState<Date | null>(
    article.scheduledPublishAt ? new Date(article.scheduledPublishAt) : null
  );
  const [imagePreview, setImagePreview] = useState<string | null>(article.coverImage);
  const [imageFiles, setImageFiles] = useState<Map<LanguageCode, File>>(new Map());

    // Variants state
    const [variants, setVariants] = useState<ArticleVariant[]>(initializeVariants());
    const [activeVariant, setActiveVariant] = useState<LanguageCode>(defaultLanguage);

  // Sync form fields with active variant (default or selected)
  useEffect(() => {
    const currentVariant = variants.find(v => v.lang === activeVariant);
    if (currentVariant) {
      setTitle(currentVariant.title);
      setExcerpt(currentVariant.excerpt);
      setContent(currentVariant.content);
      setImagePreview(currentVariant.coverImage || null);
    }
  }, [activeVariant, variants]);

  // Update variant when form fields change
  const updateActiveVariant = (updates: Partial<ArticleVariant>) => {
    setVariants(prev => prev.map(variant => 
      variant.lang === activeVariant 
        ? { ...variant, ...updates }
        : variant
    ));
  };


  // Handle image upload
  const handlePickedImage = (file: File | null) => {
    if (!file) {
      setImageFiles(prev => {
        const next = new Map(prev);
        next.delete(activeVariant);
        return next;
      });
      setImagePreview(null);
      updateActiveVariant({ coverImage: undefined });
      return;
    }
    setImageFiles(prev => {
      const next = new Map(prev);
      next.set(activeVariant, file);
      return next;
    });
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setImagePreview(imageUrl);
      updateActiveVariant({ coverImage: imageUrl });
    };
    reader.readAsDataURL(file);
  };

  // Remove image (deferred deletion - only marks for deletion)
  const handleRemoveImage = () => {
    const currentVariant = variants.find(v => v.lang === activeVariant);
    const hasNewImageFile = imageFiles.has(activeVariant);
    const hasServerImage = currentVariant?.coverImage && !hasNewImageFile;

    // Mark server image for deletion on submit (not immediate)
    if (hasServerImage) {
      setImagesToDelete(prev => new Set(prev).add(activeVariant));
    }

    setImagePreview(null);
    setImageFiles(prev => {
      const next = new Map(prev);
      next.delete(activeVariant);
      return next;
    });
    updateActiveVariant({ coverImage: undefined });
    // Reset file input
    const input = document.getElementById("image-upload") as HTMLInputElement;
    if (input) input.value = "";
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
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
      toast.loading("Updating article content and metadata...", { id: toastId });
      
      // Get default language variant for main article
      const defaultVariant = variants.find(v => v.lang === defaultLanguage);
      if (!defaultVariant) {
        throw new Error("Default language variant not found");
      }
      
      // Prepare variants (exclude default language as it goes to main article)
      const articleVariants = variants
        .filter(v => v.lang !== defaultLanguage)
        .map(v => ({
          lang: v.lang,
          title: v.title,
          excerpt: v.excerpt,
          content: v.content,
          coverImage: v.coverImage,
        }));

      await updateArticle(article.id, {
        title: defaultVariant.title,
        excerpt: defaultVariant.excerpt,
        content: defaultVariant.content,
        status,
        scheduledPublishAt: status === "scheduled" ? scheduledPublishAt : null,
        variants: articleVariants,
      });

      // Step 2: Delete marked images from server and R2
      if (imagesToDelete.size > 0) {
        const totalDeletes = imagesToDelete.size;
        let deletedCount = 0;

        for (const lang of imagesToDelete) {
          deletedCount++;
          toast.loading(`Deleting cover image ${deletedCount}/${totalDeletes}...`, { id: toastId });

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
          toast.loading(`Uploading cover image ${uploadedCount}/${totalImages}...`, { id: toastId });

          const form = new FormData()
          form.append("file", file)
          form.append("projectId", article.projectId)
          form.append("postId", article.id)
          form.append("type", "banner")

          const res = await fetch("/api/uploads", {
            method: "POST",
            body: form,
          })

          if (!res.ok) {
            throw new Error(`Failed to upload image for ${lang}`)
          }

          const data = await res.json()

          await updateArticleCoverImage({
            articleId: article.id,
            objectKey: data.key,
            variantLang: lang,
          })
        }
      }

      // Step 4: Success
      toast.success("Article updated successfully!", { id: toastId });

      router.push(`/${currentProject?.slug}/articles`);
      router.refresh();
    } catch (error) {
      console.error("Error updating article:", error);
      toast.error("Failed to update article. Please try again.", { id: toastId });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
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
          />

          <ArticleContentEditor
            content={content}
            onContentChange={(newContent) => {
              setContent(newContent);
              updateActiveVariant({ content: newContent });
            }}
            textareaId="content"
            placeholder="Write your article content..."
          />
        </div>

        <div className="lg:col-span-1 space-y-4">
          <ArticleVisibilityCard
            status={status}
            onStatusChange={(v) => setStatus(v)}
            isSubmitting={isSubmitting}
            submitLabel="Update"
            scheduledPublishAt={scheduledPublishAt}
            onScheduleChange={setScheduledPublishAt}
            projectTimezone="UTC"
            projectId={currentProject?.id}
            leftAction={(
              <Link
                href={`/${currentProject?.slug}/articles`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <X />
                Cancel
              </Link>
            )}
          />

          <ArticleBannerUpload
            imagePreview={imagePreview}
            onImageChange={handlePickedImage}
            onRemoveImage={handleRemoveImage}
            uploadLabel={activeVariant === defaultLanguage ? "Change Image" : `Change Image for ${getLanguageName(activeVariant)}`}
            emptyDescription={
              activeVariant === defaultLanguage
                ? "Update the article cover image."
                : `Upload a specific image for ${getLanguageName(activeVariant)} variant. Each variant can have its own image.`
            }
          />

          <VariantCard
            defaultLanguage={defaultLanguage}
            variants={variants}
            onVariantsUpdate={setVariants}
            onVariantSelect={setActiveVariant}
            activeVariant={activeVariant}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </form>
  );
}

