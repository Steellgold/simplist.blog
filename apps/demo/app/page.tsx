import Link from "next/link";
import { simplist } from "@/lib/simplist";
import type { ArticleListItem, LanguageCode } from "@simplist.blog/sdk";
import { PopularTags } from "@/components/PopularTags";

interface HomeProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
    const locale = params.lang as LanguageCode;

  // Fetch articles using the Simplist SDK
  const response = await simplist.articles.published({
    limit: 20,
    sort: "publishedAt",
    order: "desc",
  });

  const articles: ArticleListItem[] = response.data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {locale === "fr" ? "Blog Démo" : "Demo Blog"}
            </h1>
            <div className="flex gap-2">
              <Link
                href="/?lang=en"
                className={`rounded px-3 py-1 ${
                  locale === "en"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                EN
              </Link>
              <Link
                href="/?lang=fr"
                className={`rounded px-3 py-1 ${
                  locale === "fr"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                FR
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="mb-6 text-xl font-semibold text-gray-800">
          {locale === "fr" ? "Articles récents" : "Recent Articles"}
        </h2>

        {articles.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-gray-600">
              {locale === "fr"
                ? "Aucun article disponible pour le moment."
                : "No articles available at the moment."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => {
              // Get the title and excerpt from variants if available
              const variant = article.variants?.[locale];
              const title = variant?.title || article.title;
              const excerpt = variant?.excerpt || article.excerpt;
              const readTime =
                variant?.readTimeMinutes || article.readTimeMinutes;

              return (
                <article
                  key={article.id}
                  className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
                >
                  <Link
                    href={`/article/${article.slug}?lang=${locale}`}
                    className="group"
                  >
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                      {title}
                    </h3>
                    {excerpt && <p className="mb-4 text-gray-600">{excerpt}</p>}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {article.author && (
                        <span>
                          {locale === "fr" ? "Par" : "By"} {article.author.name}
                        </span>
                      )}
                      {article.publishedAt && (
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString(
                            locale === "fr" ? "fr-FR" : "en-US",
                            { year: "numeric", month: "long", day: "numeric" },
                          )}
                        </span>
                      )}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex gap-2">
                          {article.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag.name}
                              className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="text-gray-400">
                        {readTime} min {locale === "fr" ? "de lecture" : "read"}
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Popular Tags */}
      <div className="mx-auto max-w-4xl px-4 pb-8">
        <PopularTags locale={locale} />
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 text-center text-sm text-gray-600">
          {locale === "fr"
            ? "Propulsé par Simplist.blog"
            : "Powered by Simplist.blog"}
        </div>
      </footer>
    </div>
  );
}
