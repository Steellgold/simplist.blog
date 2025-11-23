// Format bytes to human readable string
export const formatBytes = (bytes: bigint): string => {
  const sizes = ["Bytes", "KB", "MB", "GB"]
  if (bytes === BigInt(0)) return "0 Bytes"
  
  const i = Math.floor(Math.log(Number(bytes)) / Math.log(1024))
  const value = Number(bytes) / Math.pow(1024, i)
  
  return `${Math.round(value * 100) / 100} ${sizes[i]}`
}

// Format article for API response
export const formatArticle = (article: any) => {
  const formatted = {
    ...article,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    publishedAt: article.publishedAt?.toISOString() || null
  }

  // Format variants as key-value map if present
  if (article.variants && Array.isArray(article.variants)) {
    formatted.variants = formatVariants(article.variants)
  }

  return formatted
}

// Format article variants as key-value map
export const formatVariants = (variants: any[]) => {
  const formattedVariants: Record<string, any> = {}
  
  for (const variant of variants) {
    formattedVariants[variant.lang] = {
      lang: variant.lang,
      title: variant.title,
      excerpt: variant.excerpt,
      content: variant.content,
      coverImage: variant.coverImage,
      wordCount: variant.wordCount,
      characterCount: variant.characterCount,
      lineCount: variant.lineCount,
      readTimeMinutes: variant.readTimeMinutes,
      createdAt: variant.createdAt.toISOString(),
      updatedAt: variant.updatedAt.toISOString(),
    }
  }
  
  return formattedVariants
}

// Format project for API response
export const formatProject = (project: any) => {
  return {
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString()
  }
}