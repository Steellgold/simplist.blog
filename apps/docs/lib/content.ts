import { existsSync, promises as fs } from "fs"
import { compileMDX } from "next-mdx-remote/rsc"
import path from "path"

export type DocNavItem = {
  title: string
  href: string
  description?: string
  icon?: string
  category?: string
  order?: number
}

const CONTENT_ROOTS = [
  path.join(process.cwd(), "apps", "docs", "content"),
  path.join(process.cwd(), "content"),
]

const getContentRoot = () => CONTENT_ROOTS.find(existsSync) ?? CONTENT_ROOTS[0]

const findMdxFile = async (slug: string[]): Promise<string | null> => {
  const slugPath = slug.join("/")
  
  for (const root of CONTENT_ROOTS) {
    for (const candidate of [`${slugPath}.mdx`, `${slugPath}/index.mdx`]) {
      const fullPath = path.join(root, candidate)
      if (existsSync(fullPath)) return fullPath
    }
  }
  return null
}

export const readMdxFileContent = async (slug: string[]): Promise<string> => {
  const filePath = await findMdxFile(slug)
  if (!filePath) return ""
  
  try {
    return await fs.readFile(filePath, "utf-8")
  } catch {
    return ""
  }
}

export const getMdxFrontmatter = async (slug: string[]) => {
  const content = await readMdxFileContent(slug)
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/)
  
  if (!match) return {}
  
  const parse = (key: string) => 
    match[1].match(new RegExp(`${key}:\\s*(.+)`, "i"))?.[1]?.replace(/^["']|["']$/g, "").trim()
  
  return { category: parse("category"), title: parse("title") }
}

// Navigation - parsing complet du frontmatter
const parseNavItem = async (filePath: string, relativePath: string): Promise<DocNavItem | null> => {
  try {
    const source = await fs.readFile(filePath, "utf8")
    const { frontmatter } = await compileMDX<Record<string, unknown>>({
      source,
      options: { parseFrontmatter: true },
    })

    const slugPath = relativePath.replace(/\\/g, "/").replace(/\.mdx$/, "")
    const fm = frontmatter ?? {}

    return {
      title: (fm.title as string) ?? slugPath.split("/").pop()?.replace(/-/g, " ") ?? "Page",
      href: slugPath === "index" ? "/" : `/${slugPath}`,
      description: fm.description as string | undefined,
      icon: fm.icon as string | undefined,
      category: fm.category as string | undefined,
      order: fm.order !== undefined ? Number(fm.order) : undefined,
    }
  } catch {
    return null
  }
}

const walkContentDir = async (root: string, dir = ""): Promise<DocNavItem[]> => {
  const dirPath = path.join(root, dir)
  if (!existsSync(dirPath)) return []
  
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  const items: DocNavItem[] = []

  for (const entry of entries) {
    const relPath = path.join(dir, entry.name)
    
    if (entry.isDirectory()) {
      items.push(...await walkContentDir(root, relPath))
    } else if (entry.name.endsWith(".mdx")) {
      const item = await parseNavItem(path.join(root, relPath), relPath)
      if (item) items.push(item)
    }
  }

  return items
}

export const getDocsNavItems = async (): Promise<DocNavItem[]> => {
  const items = await walkContentDir(getContentRoot())
  
  return items.sort((a, b) => 
    (a.order ?? Infinity) - (b.order ?? Infinity) ||
    (a.category ?? "").localeCompare(b.category ?? "") ||
    a.title.localeCompare(b.title)
  )
}

export const getPageImage = (slug: string[]) => ({
  segments: [...slug, "image.png"],
  url: `/og/${[...slug, "image.png"].join("/")}`,
})