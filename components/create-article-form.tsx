"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { createArticle, updateArticleCoverImage } from "@/lib/actions/articles";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "./ui/spinner";
import { ArticleInfoFields } from "./article-info-fields";
import { ArticleContentEditor } from "./article-content-editor";
import { ArticleVisibilityCard } from "./article-visibility-card";
import { ArticleBannerUpload } from "./article-banner-upload";

type ArticleStatus = "draft" | "published";

type CreateArticleFormProps = {
  projectId: string;
};

export const CreateArticleForm = ({ projectId }: CreateArticleFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<ArticleStatus>("draft");
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

    try {
      // Create article first
      const article = await createArticle({
        title,
        excerpt,
        content,
        status,
        coverImage: undefined,
      });

      // If an image is selected, upload via server API (avoid CORS) then set cover
      if (imageFile && article) {
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

        const data = await res.json()

        await updateArticleCoverImage({
          articleId: article.id,
          objectKey: data.key,
        })
      }

      // Redirect to articles page
      router.push("/articles");
      router.refresh();
    } catch (error) {
      console.error("Error creating article:", error);
      alert("Failed to create article. Please try again.");
    } finally {
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
            projectId={projectId}
            textareaId="content"
            placeholder="Write your new article here... tell your idea, your story, or share an interesting piece of information."
          />
        </div>

        <div className="lg:col-span-1 space-y-4">
          <ArticleVisibilityCard
            status={status}
            onStatusChange={(v) => setStatus(v)}
            isSubmitting={isSubmitting}
            submitLabel={isSubmitting ? "" : "Publish"}
            leftAction={(
              <Link
                href="/articles"
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
