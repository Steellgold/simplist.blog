import type { SeoMetadata } from "../schemas/seo"

export const generateSeoMetadata = (article: any, project: any, baseUrl?: string, lang?: string): SeoMetadata => {
  // Use specific variant if lang is provided, otherwise use main article
  const variant = lang && article.variants?.[lang] ? article.variants[lang] : article
  const isVariant = variant !== article
  
  const title = variant.title
  const summarySource = (variant.content || "").substring(0, 4000)
  const description = variant.excerpt || `${summarySource.substring(0, 160)}...`
  const canonicalUrl = baseUrl ? `${baseUrl}/${project.slug}/${article.slug}${isVariant ? `?lang=${lang}` : ''}` : undefined
  const ogImage = variant.coverImage || article.coverImage || undefined
  const publishedTime = article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined
  const modifiedTime = new Date(variant.updatedAt || article.updatedAt).toISOString()

  // Generate keywords from variant content (tronqué)
  const keywords = generateKeywords(title, summarySource)

  // Generate structured data for articles
  const structuredData = generateArticleStructuredData(variant, project, canonicalUrl, lang)

  // Generate hreflang tags for multilingual variants
  const hreflang = generateHreflangTags(article, baseUrl, project.slug)

  return {
    metaTitle: title,
    metaDescription: description,
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogType: "article",
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
    twitterCard: "summary_large_image",
    canonicalUrl,
    structuredData,
    keywords,
    language: lang || "en",
    author: project.name,
    publishedTime,
    modifiedTime,
    readingTime: variant.readTimeMinutes || article.readTimeMinutes,
    hreflang
  }
}

export const generateKeywords = (title: string, content: string, maxKeywords = 10): string[] => {
  // Simple keyword extraction (could be improved with NLP)
  const text = `${title} ${content}`.toLowerCase()
  
  // Remove common stop words
  const stopWords = new Set([
    "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
    "a", "an", "is", "are", "was", "were", "be", "been", "have", "has", "had",
    "do", "does", "did", "will", "would", "could", "should", "may", "might",
    "can", "this", "that", "these", "those", "i", "you", "he", "she", "it",
    "we", "they", "me", "him", "her", "us", "them"
  ])
  
  // Extract words (simple regex)
  const words = text
    .match(/\b[a-z]{3,}\b/g) || []
    
  // Count word frequency
  const wordCount = new Map<string, number>()
  words.forEach(word => {
    if (!stopWords.has(word)) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    }
  })
  
  // Sort by frequency and return top keywords
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word)
}

export const generateArticleStructuredData = (article: any, project: any, url?: string, lang?: string) => {
  const summarySource = (article.content || "").substring(0, 4000)
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || `${summarySource.substring(0, 160)}...`,
    image: article.coverImage || undefined,
    author: {
      "@type": "Organization",
      name: project.name
    },
    publisher: {
      "@type": "Organization",
      name: project.name
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    wordCount: article.wordCount,
    timeRequired: `PT${article.readTimeMinutes}M`,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url
    },
    articleSection: "Blog",
    inLanguage: lang ? `${lang}-${lang.toUpperCase()}` : "en-US"
  }
}

/**
 * Generate hreflang tags for multilingual variants
 */
export const generateHreflangTags = (article: any, baseUrl?: string, projectSlug?: string) => {
  if (!baseUrl || !projectSlug || !article.variants) {
    return []
  }

  const hreflangTags = []
  const baseUrlPath = `${baseUrl}/${projectSlug}/${article.slug}`

  // Add main article (default language)
  hreflangTags.push({
    lang: "x-default",
    url: baseUrlPath
  })

  // Add each variant
  Object.keys(article.variants).forEach(lang => {
    hreflangTags.push({
      lang,
      url: `${baseUrlPath}?lang=${lang}`
    })
  })

  return hreflangTags
}

export const generateRSSFeed = (articles: any[], project: any, baseUrl: string, lang?: string, customPath?: string): string => {
  // The feed URL should point to the user's site RSS endpoint, not the API
  const feedUrl = `${baseUrl}/rss.xml${lang ? `?lang=${lang}` : ''}`
  const siteUrl = baseUrl
  
  const rssHeader = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${project.name}${lang ? ` (${lang.toUpperCase()})` : ''}]]></title>
    <description><![CDATA[Articles from ${project.name}]]></description>
    <link>${siteUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <language>${lang || 'en'}</language>
    <generator>Simplist API</generator>`

  const rssItems = articles.map(article => {
    // Use variant content if lang is specified and variant exists
    const variant = lang && article.variants?.[lang] ? article.variants[lang] : article
    
    // Use custom path if provided, otherwise use just the article slug (no project slug)
    const articlePath = customPath ? customPath.replace('{slug}', article.slug) : article.slug
    const articleUrl = `${siteUrl}/${articlePath}${lang ? `?lang=${lang}` : ''}`
    const pubDate = article.publishedAt ? new Date(article.publishedAt).toUTCString() : new Date(article.createdAt).toUTCString()
    
    return `
    <item>
      <title><![CDATA[${variant.title}]]></title>
      <description><![CDATA[${variant.excerpt || `${variant.content.substring(0, 300)}...`}]]></description>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <content:encoded><![CDATA[${variant.content}]]></content:encoded>
    </item>`
  }).join("")

  const rssFooter = `
  </channel>
</rss>`

  return rssHeader + rssItems + rssFooter
}

export const generateSitemap = (articles: any[], project: any, baseUrl: string, lang?: string, customPath?: string): string => {
  const sitemapHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`

  const urls = articles.flatMap(article => {
    // Use custom path if provided, otherwise use just the article slug (no project slug)
    const articlePath = customPath ? customPath.replace('{slug}', article.slug) : article.slug
    const baseUrlPath = `${baseUrl}/${articlePath}`
    const lastMod = new Date(article.updatedAt).toISOString().split("T")[0]
    
    const urls = []
    
    // Add main article URL
    urls.push(`
  <url>
    <loc>${baseUrlPath}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${generateHreflangLinks(article, baseUrl, project.slug, customPath)}
  </url>`)

    // Add variant URLs if they exist
    if (article.variants) {
      Object.keys(article.variants).forEach(variantLang => {
        const variantUrl = `${baseUrlPath}?lang=${variantLang}`
        urls.push(`
  <url>
    <loc>${variantUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${generateHreflangLinks(article, baseUrl, project.slug, customPath)}
  </url>`)
      })
    }
    
    return urls
  }).join("")

  // Add project index page (only if no custom path or if custom path allows it)
  const projectUrl = (!customPath || customPath.includes('{slug}')) ? `
  <url>
    <loc>${baseUrl}/${customPath ? customPath.replace(/\/[^\/]+$/, '') : project.slug}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>` : ""

  const sitemapFooter = `
</urlset>`

  return sitemapHeader + projectUrl + urls + sitemapFooter
}

/**
 * Generate hreflang links for sitemap
 */
export const generateHreflangLinks = (article: any, baseUrl: string, projectSlug: string, customPath?: string) => {
  if (!article.variants) {
    return ""
  }

  const articlePath = customPath ? customPath.replace('{slug}', article.slug) : article.slug
  const baseUrlPath = `${baseUrl}/${articlePath}`
  const hreflangLinks = []

  // Add main article
  hreflangLinks.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrlPath}" />`)

  // Add each variant
  Object.keys(article.variants).forEach(lang => {
    hreflangLinks.push(`    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrlPath}?lang=${lang}" />`)
  })

  return hreflangLinks.join("\n")
}