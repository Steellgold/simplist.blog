import { prisma } from "@simplist/db";

interface ArticleContent {
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  wordCount: number;
  characterCount: number;
  lineCount: number;
  readTimeMinutes: number;
}

/**
 * Migrates article variants when the project's default language changes.
 * Swaps content between the main article and existing variants to preserve all translations.
 *
 * @param projectId - The project ID
 * @param oldDefaultLang - The previous default language code (e.g., "en")
 * @param newDefaultLang - The new default language code (e.g., "fr")
 * @returns Number of articles migrated
 */
export async function migrateArticleVariantsOnLanguageChange(
  projectId: string,
  oldDefaultLang: string,
  newDefaultLang: string,
): Promise<number> {
  if (oldDefaultLang === newDefaultLang) {
    return 0;
  }

  // Fetch all articles in the project
  const articles = await prisma.article.findMany({
    where: {
      projectId,
      status: {
        not: "deleted",
      },
    },
    include: {
      variants: true,
    },
  });

  let migratedCount = 0;

  // Process each article in a transaction
  for (const article of articles) {
    await prisma.$transaction(async (tx) => {
      // Check if a variant exists for the new default language
      const newDefaultVariant = article.variants.find(
        (v) => v.lang === newDefaultLang,
      );

      if (newDefaultVariant) {
        // SWAP SCENARIO: Variant exists for the new default language
        // We need to swap the content between main article and variant

        // 1. Save current article content (old default language)
        const oldDefaultContent: ArticleContent = {
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          coverImage: article.coverImage,
          wordCount: article.wordCount,
          characterCount: article.characterCount,
          lineCount: article.lineCount,
          readTimeMinutes: article.readTimeMinutes,
        };

        // 2. Update main article with new default variant content
        await tx.article.update({
          where: { id: article.id },
          data: {
            title: newDefaultVariant.title,
            excerpt: newDefaultVariant.excerpt,
            content: newDefaultVariant.content,
            coverImage: newDefaultVariant.coverImage,
            wordCount: newDefaultVariant.wordCount,
            characterCount: newDefaultVariant.characterCount,
            lineCount: newDefaultVariant.lineCount,
            readTimeMinutes: newDefaultVariant.readTimeMinutes,
          },
        });

        // 3. Update the variant to become the old default language
        await tx.articleVariant.update({
          where: { id: newDefaultVariant.id },
          data: {
            lang: oldDefaultLang,
            title: oldDefaultContent.title,
            excerpt: oldDefaultContent.excerpt,
            content: oldDefaultContent.content,
            coverImage: oldDefaultContent.coverImage,
            wordCount: oldDefaultContent.wordCount,
            characterCount: oldDefaultContent.characterCount,
            lineCount: oldDefaultContent.lineCount,
            readTimeMinutes: oldDefaultContent.readTimeMinutes,
          },
        });

        migratedCount++;
      }
      // If no variant exists for the new default language, leave the article as-is
      // (Option B: no migration)
    });
  }

  return migratedCount;
}
