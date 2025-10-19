"use client";

import { buttonVariants } from "@/components/ui/button";
import { updateArticle, updateArticleCoverImage, removeArticleCoverImage } from "@/lib/actions/articles";
import { X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArticleInfoFields } from "./article-info-fields";
import { ArticleContentEditor } from "./article-content-editor";
import { ArticleVisibilityCard } from "./article-visibility-card";
import { ArticleBannerUpload } from "./article-banner-upload";

type ArticleStatus = "draft" | "published";

type Article = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  status: string;
  coverImage: string | null;
  projectId: string;
};

type EditArticleFormProps = {
  article: Article;
};

export const EditArticleForm = ({ article }: EditArticleFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);

  // Form state
  const [title, setTitle] = useState(article.title);
  const [excerpt, setExcerpt] = useState(article.excerpt || "");
  const [content, setContent] = useState(article.content);
  const [status, setStatus] = useState<ArticleStatus>(article.status as ArticleStatus);
  const [imagePreview, setImagePreview] = useState<string | null>(article.coverImage);
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
  const handleRemoveImage = async () => {
    setIsRemovingImage(true);
    
    // If there's a server image, delete it
    if (article.coverImage && !imageFile) {
      try {
        await removeArticleCoverImage(article.id);
        router.refresh();
      } catch (error) {
        console.error("Failed to remove cover image:", error);
        alert("Failed to remove image");
        setIsRemovingImage(false);
        return;
      }
    }
    
    setImagePreview(null);
    setImageFile(null);
    // Reset file input
    const input = document.getElementById("image-upload") as HTMLInputElement;
    if (input) input.value = "";
    
    setIsRemovingImage(false);
  };


  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update article first
      await updateArticle(article.id, {
        title,
        excerpt,
        content,
        status,
      });

      // If a new image is selected, upload to R2 and update the article cover
      if (imageFile) {
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
      console.error("Error updating article:", error);
      alert("Failed to update article. Please try again.");
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
            cardDescription="Edit the main information of the post."
          />

          <ArticleContentEditor
            content={content}
            onContentChange={setContent}
            textareaId="content"
            placeholder="Write your article here... tell your idea, your story, or share an interesting piece of information."
          />
        </div>

        <div className="lg:col-span-1 space-y-4">
          <ArticleVisibilityCard
            status={status}
            onStatusChange={(v) => setStatus(v)}
            isSubmitting={isSubmitting}
            submitLabel="Update"
            leftAction={(
              <Link
                href="/articles"
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
            uploadLabel="Change Image"
            emptyDescription="Update the article cover image."
            isRemoving={isRemovingImage}
          />
        </div>
      </div>
    </form>
  );
}

