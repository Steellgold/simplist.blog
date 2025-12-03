import { existsSync, promises as fs } from "fs"
import path from "path"

export type SearchResult = {
  title: string
  href: string
  description?: string
  icon?: string
  content: string
  matches: number
}

const getContentRoot = (): string => {
  const possibleRoots = [
    path.join(process.cwd(), "apps", "docs", "content"),
    path.join(process.cwd(), "content"),
  ]
  
  for (const root of possibleRoots) {
    if (existsSync(root)) {
      return root
    }
  }
  
  return possibleRoots[0]
}

const CONTENT_ROOT = getContentRoot()

const readMdxFile = async (relativePath: string): Promise<string | null> => {
  const fullPath = path.join(CONTENT_ROOT, relativePath)
  
  try {
    const content = await fs.readFile(fullPath, "utf8")
    return content
  } catch {
    return null
  }
}

const extractFrontmatter = (content: string): { frontmatter: Record<string, any>, body: string } => {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)
  
  if (match) {
    const frontmatterText = match[1]
    const body = match[2]
    
    const frontmatter: Record<string, any> = {}
    const lines = frontmatterText.split("\n")
    
    for (const line of lines) {
      const colonIndex = line.indexOf(":")
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim()
        const value = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, "")
        frontmatter[key] = value
      }
    }
    
    return { frontmatter, body }
  }
  
  return { frontmatter: {}, body: content }
}

const countMatches = (text: string, query: string): number => {
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  let count = 0
  let index = 0
  
  while ((index = lowerText.indexOf(lowerQuery, index)) !== -1) {
    count++
    index += lowerQuery.length
  }
  
  return count
}

const searchInMdxFiles = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) {
    return []
  }
  
  const results: SearchResult[] = []
  const lowerQuery = query.toLowerCase()
  
  const walkDir = async (dir = ""): Promise<void> => {
    const dirPath = path.join(CONTENT_ROOT, dir)
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          await walkDir(path.join(dir, entry.name))
        } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
          const relPath = path.join(dir, entry.name)
          const content = await readMdxFile(relPath)
          
          if (!content) continue
          
          const { frontmatter, body } = extractFrontmatter(content)
          
          const title = frontmatter.title || entry.name.replace(/\.mdx$/, "").replace(/-/g, " ")
          const description = frontmatter.description || ""
          const searchableText = `${title} ${description} ${body}`.toLowerCase()
          
          if (searchableText.includes(lowerQuery)) {
            const slugPath = relPath.replace(/\\/g, "/").replace(/\.mdx$/, "")
            const href = slugPath === "index" ? "/" : `/${slugPath}`
            
            const titleMatches = countMatches(title, query)
            const descMatches = countMatches(description, query)
            const bodyMatches = countMatches(body, query)
            const totalMatches = titleMatches * 3 + descMatches * 2 + bodyMatches
            
            results.push({
              title,
              href,
              description,
              icon: frontmatter.icon,
              content: body.slice(0, 200),
              matches: totalMatches,
            })
          }
        }
      }
    } catch {
      console.error("Error reading directory:", dirPath)
    }
  }
  
  await walkDir()
  return results.sort((a, b) => b.matches - a.matches)
}

export const searchDocs = async (query: string): Promise<SearchResult[]> => {
  return searchInMdxFiles(query)
}
