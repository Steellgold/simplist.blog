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

function getContentRoot(): string {
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

async function readMdxFrontmatter(relativePath: string): Promise<DocNavItem | null> {
  const fullPath = path.join(CONTENT_ROOT, relativePath)

  try {
    const source = await fs.readFile(fullPath, "utf8")

    const { frontmatter } = await compileMDX<never>({
      source,
      options: {
        parseFrontmatter: true,
      },
    })

    const slugPath = relativePath.replace(/\\/g, "/").replace(/\.mdx$/, "")

    const href = slugPath === "index" ? "/" : `/${slugPath}`

    const fm: any = frontmatter ?? {}

    const titleFromSlug = slugPath.split("/").at(-1) ?? "Page"

    const title: string = fm.title ?? titleFromSlug.replace(/-/g, " ")

    return {
      title,
      href,
      description: fm.description,
      icon: fm.icon,
      category: fm.category,
      order: fm.order !== undefined ? Number(fm.order) : undefined,
    }
  } catch {
    return null
  }
}

async function walkContentDir(dir = ""): Promise<DocNavItem[]> {
  const dirPath = path.join(CONTENT_ROOT, dir)
  const entries = await fs.readdir(dirPath, { withFileTypes: true })

  const items: DocNavItem[] = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const childItems = await walkContentDir(path.join(dir, entry.name))
      items.push(...childItems)
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      const relPath = path.join(dir, entry.name)
      const meta = await readMdxFrontmatter(relPath)
      if (meta) {
        items.push(meta)
      }
    }
  }

  return items.sort((a, b) => {
    const orderA = a.order ?? Infinity
    const orderB = b.order ?? Infinity
    if (orderA !== orderB) {
      return orderA - orderB
    }

    const categoryA = a.category || ""
    const categoryB = b.category || ""
    if (categoryA !== categoryB) {
      return categoryA.localeCompare(categoryB)
    }

    return a.title.localeCompare(b.title)
  })
}

export async function getDocsNavItems(): Promise<DocNavItem[]> {
  return walkContentDir()
}