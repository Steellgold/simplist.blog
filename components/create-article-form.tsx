"use client";

import { buttonVariants } from "@/components/ui/button";
import { createArticle, updateArticleCoverImage } from "@/lib/actions/articles";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArticleBannerUpload } from "./article-banner-upload";
import { ArticleContentEditor } from "./article-content-editor";
import { ArticleInfoFields } from "./article-info-fields";
import { ArticleVisibilityCard } from "./article-visibility-card";
import { useProjectContext } from "./project-context-provider";

type ArticleStatus = "draft" | "published" | "scheduled";

type CreateArticleFormProps = {
  projectId: string;
};

export const CreateArticleForm = ({ projectId }: CreateArticleFormProps) => {
  const router = useRouter();
  const { currentProject } = useProjectContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<ArticleStatus>("draft");
  const [scheduledPublishAt, setScheduledPublishAt] = useState<Date | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Handle image upload
  const handlePickedImage = (file: File | null) => {
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
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
      const article = await createArticle({
        title,
        excerpt,
        content,
        status,
        coverImage: undefined,
        scheduledPublishAt: status === "scheduled" ? scheduledPublishAt : undefined,
      });

      // Step 2: Upload image if provided
      if (imageFile && article) {
        toast.loading("Uploading cover image...", { id: toastId });
        const form = new FormData()
        form.append("file", imageFile)
        form.append("projectId", projectId)
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
            onTitleChange={setTitle}
            onExcerptChange={setExcerpt}
            cardDescription="This is the main information of the post."
          />

          <ArticleContentEditor
            content={content}
            onContentChange={setContent}
            textareaId="content"
            placeholder="Write your new article here... tell your idea, your story, or share an interesting piece of information."
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
            uploadLabel="Upload Image"
            emptyDescription="On the response API it will return the URL of the image."
          />
        </div>
      </div>
    </form>
  );
}
