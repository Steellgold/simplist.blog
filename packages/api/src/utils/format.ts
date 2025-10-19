// Format bytes to human readable string
export const formatBytes = (bytes: bigint): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === BigInt(0)) return '0 Bytes'
  
  const i = Math.floor(Math.log(Number(bytes)) / Math.log(1024))
  const value = Number(bytes) / Math.pow(1024, i)
  
  return `${Math.round(value * 100) / 100} ${sizes[i]}`
}

// Format article for API response
export const formatArticle = (article: any) => {
  return {
    ...article,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    publishedAt: article.publishedAt?.toISOString() || null
  }
}

// Format project for API response
export const formatProject = (project: any) => {
  return {
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString()
  }
}