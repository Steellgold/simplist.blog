"use client";

import { buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useProject } from "@/hooks/use-project-context";
import { type ArticleVariant } from "@/hooks/use-variant-operations";
import { createArticle, updateArticleCoverImage } from "@/lib/actions/articles";
import { type LanguageCode, getLanguageName } from "@/lib/types/languages";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArticleBannerUpload } from "./banner-upload";
import { ArticleContentEditor } from "./content-editor";
import { ArticleInfoFields } from "./info-fields";
import { VariantCard } from "./variant-card";
import { ArticleVisibilityCard } from "./visibility-card";

type ArticleStatus = "draft" | "published" | "scheduled";

type CreateArticleFormProps = {
  projectId: string;
};

export const CreateArticleForm = ({ projectId }: CreateArticleFormProps) => {
  const router = useRouter();
  const { currentProject } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default language from project or fallback to English
  const defaultLanguage: LanguageCode = (currentProject?.defaultLanguage as LanguageCode) || "en";

  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<ArticleStatus>("draft");
  const [scheduledPublishAt, setScheduledPublishAt] = useState<Date | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

    // Variants state
    const [variants, setVariants] = useState<ArticleVariant[]>([
      { lang: defaultLanguage, title: "", excerpt: "", content: "" }
    ]);
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
      setImageFile(null);
      setImagePreview(null);
      updateActiveVariant({ coverImage: undefined });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setImagePreview(imageUrl);
      updateActiveVariant({ coverImage: imageUrl });
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
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

    const toastId = toast.loading("Creating article...");

    try {
      // Step 1: Create article
      toast.loading("Generating slug and calculating stats...", { id: toastId });
      
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

      const article = await createArticle({
        title: defaultVariant.title,
        excerpt: defaultVariant.excerpt,
        content: defaultVariant.content,
        status,
        coverImage: defaultVariant.coverImage,
        scheduledPublishAt: status === "scheduled" ? scheduledPublishAt || undefined : undefined,
        projectId: currentProject?.id,
        variants: articleVariants.length > 0 ? articleVariants : undefined,
      });

      // Step 2: Upload image if provided
      if (imageFile && article) {
        toast.loading("Uploading cover image...", { id: toastId });
        const form = new FormData()
        form.append("file", imageFile)
        form.append("projectId", article.projectId)
        form.append("postId", article.id)

        const res = await fetch("/api/uploads/banner", {
          method: "POST",
          body: form,
        })

        if (!res.ok) {
          throw new Error("Failed to upload image to storage")
        }

        toast.loading("Processing image and updating article...", { id: toastId });
        const data = await res.json()

        await updateArticleCoverImage({
          articleId: article.id,
          objectKey: data.key,
        })
      }

      // Step 3: Success
      toast.success("Article created successfully!", { id: toastId });

      // Redirect to articles page
      router.push(`/${currentProject?.slug}/articles`);
      router.refresh();
    } catch (error) {
      console.error("Error creating article:", error);
      toast.error("Failed to create article. Please try again.", { id: toastId });
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
            submitLabel="Publish"
            scheduledPublishAt={scheduledPublishAt}
            onScheduleChange={setScheduledPublishAt}
            projectTimezone="UTC"
            projectId={currentProject?.id}
            leftAction={(
              <Link
                href={`/${currentProject?.slug}/articles`}
                className={buttonVariants({ variant: "outlineDestructive", size: "sm" })}
              >
                <Trash2 />
                Delete
              </Link>
            )}
          />

          <ArticleBannerUpload
            imagePreview={imagePreview}
            onImageChange={handlePickedImage}
            onRemoveImage={handleRemoveImage}
            uploadLabel={activeVariant === defaultLanguage ? "Upload Image" : `Upload Image for ${getLanguageName(activeVariant)}`}
            emptyDescription={
              activeVariant === defaultLanguage 
                ? "On the response API it will return the URL of the image."
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
