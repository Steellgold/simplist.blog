import Link from "next/link";
import { notFound } from "next/navigation";
import { simplist, DEFAULT_LOCALE, type Locale } from "@/lib/simplist";
import { getVariantOrDefault } from "@simplist.blog/sdk";
import { MarkdownContent } from "@/components/MarkdownContent";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export default async function ArticlePage({
  params,
  searchParams,
}: ArticlePageProps) {
  const { slug } = await params;
  const search = await searchParams;
  const locale = (search.lang as Locale) || DEFAULT_LOCALE;

  // Fetch the article
  let article;
  try {
    const response = await simplist.articles.get(slug);
    article = response.data;
  } catch (error) {
    notFound();
  }

  // Get the article content in the selected language
  const variant = getVariantOrDefault(article, locale, DEFAULT_LOCALE);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href={`/?lang=${locale}`}
              className="text-blue-600 hover:text-blue-700"
            >
              ← {locale === "fr" ? "Retour aux articles" : "Back to articles"}
            </Link>
            <div className="flex gap-2">
              <Link
                href={`/article/${slug}?lang=en`}
                className={`rounded px-3 py-1 ${
                  locale === "en"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                EN
              </Link>
              <Link
                href={`/article/${slug}?lang=fr`}
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

      {/* Article Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <article className="rounded-lg bg-white p-8 shadow">
          {/* Cover Image */}
          {variant.coverImage && (
            <div className="-mx-8 -mt-8 mb-8">
              <img
                src={variant.coverImage}
                alt={variant.title}
                className="h-64 w-full rounded-t-lg object-cover"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            {variant.title}
          </h1>

          {/* Meta Information */}
          <div className="mb-8 flex flex-wrap items-center gap-4 border-b pb-8 text-sm text-gray-500">
            {article.author && (
              <div className="flex items-center gap-2">
                {article.author.image && (
                  <img
                    src={article.author.image}
                    alt={article.author.name}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span>{article.author.name}</span>
              </div>
            )}
            {article.publishedAt && (
              <span>
                {new Date(article.publishedAt).toLocaleDateString(
                  locale === "fr" ? "fr-FR" : "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </span>
            )}
            <span className="text-gray-400">
              {variant.readTimeMinutes} min{" "}
              {locale === "fr" ? "de lecture" : "read"}
            </span>
            <span className="text-gray-400">
              {article.viewCount} {locale === "fr" ? "vues" : "views"}
            </span>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-8 flex gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag.name}
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                  style={
                    tag.color
                      ? {
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                        }
                      : undefined
                  }
                >
                  {tag.icon && <span className="mr-1">{tag.icon}</span>}
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Excerpt */}
          {variant.excerpt && (
            <div className="mb-8 border-l-4 border-blue-500 pl-4 text-xl text-gray-600 italic">
              {variant.excerpt}
            </div>
          )}

          {/* Content */}
          <MarkdownContent
            content={variant.content}
            className="prose prose-lg max-w-none"
          />

          {/* Statistics */}
          <div className="mt-12 border-t pt-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              {locale === "fr" ? "Statistiques" : "Statistics"}
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded bg-gray-50 p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {variant.wordCount}
                </div>
                <div className="text-sm text-gray-600">
                  {locale === "fr" ? "mots" : "words"}
                </div>
              </div>
              <div className="rounded bg-gray-50 p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {variant.characterCount}
                </div>
                <div className="text-sm text-gray-600">
                  {locale === "fr" ? "caractères" : "characters"}
                </div>
              </div>
              <div className="rounded bg-gray-50 p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {variant.lineCount}
                </div>
                <div className="text-sm text-gray-600">
                  {locale === "fr" ? "lignes" : "lines"}
                </div>
              </div>
              <div className="rounded bg-gray-50 p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {article.viewCount}
                </div>
                <div className="text-sm text-gray-600">
                  {locale === "fr" ? "vues" : "views"}
                </div>
              </div>
            </div>
          </div>

          {/* Available Languages */}
          {article.variants && Object.keys(article.variants).length > 0 && (
            <div className="mt-8 border-t pt-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                {locale === "fr" ? "Disponible en" : "Available in"}
              </h3>
              <div className="flex gap-2">
                {Object.keys(article.variants).map((lang) => (
                  <Link
                    key={lang}
                    href={`/article/${slug}?lang=${lang}`}
                    className={`rounded px-4 py-2 ${
                      lang === locale
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

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
