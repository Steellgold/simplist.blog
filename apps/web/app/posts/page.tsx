import { SectionWrapper } from "@/components/layout/section-wrapper";
import { PostsClientWrapper } from "./_sections/posts-client-wrapper";
import { simplistClient as client } from "@/lib/blog/simplist-client";

export const revalidate = 60;

export default async function BlogPage() {
  try {
    const { data: allTags } = await client.tags.list();

    const { data } = await client.articles.list({
      page: 1,
      limit: 100
    });

    return (
      <>
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
