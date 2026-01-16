import { SectionWrapper } from "@/components/layout/section-wrapper";
import { PostsHeroSection } from "./_sections/posts-hero-section";
import { PostsClientWrapper } from "./_sections/posts-client-wrapper";
import { simplistClient } from "@/lib/blog/simplist-client";

export const revalidate = 60;

export default async function BlogPage() {
  try {
    // Fetch all tags for the filter
    const { data: allTags } = await simplistClient.tags.list();

    // Fetch ALL articles
    const { data } = await simplistClient.articles.list({
      page: 1,
      limit: 1000,
      published: true,
    });

    // If no articles at all, show empty state
    if (!data || data.length === 0) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <h1
              className="text-foreground mb-4 font-serif text-6xl font-light tracking-tight md:text-7xl"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              No content yet
            </h1>
            <p className="text-muted-foreground text-lg">
              Check back soon for new articles.
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        <SectionWrapper>
          <PostsHeroSection />
        </SectionWrapper>

        <SectionWrapper>
          <PostsClientWrapper
            tags={
              allTags?.map((t) => ({
                id: t.id,
                name: t.name,
                articleCount: t.articleCount,
                color: t.color || "",
                icon: t.icon || "",
              })) || []
            }
            articles={data || []}
          />
        </SectionWrapper>
      </>
    );
  } catch (error) {
    console.error("Error fetching articles:", error);

    return (
      <SectionWrapper>
        <div className="py-12 text-center">
          <p className="text-destructive">Failed to load articles</p>
        </div>
      </SectionWrapper>
    );
  }
}
