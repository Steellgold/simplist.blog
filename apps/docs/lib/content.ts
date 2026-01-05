import fs from "fs";
import path from "path";

export type DocNavItem = {
  title: string;
  href: string;
  description?: string;
  icon?: string;
  category?: string;
  order?: number;
};

type Frontmatter = {
  title?: string;
  description?: string;
  category?: string;
  icon?: string;
  order?: number;
};

export type DocEntry = {
  slug: string[];
  source: string;
  body: string;
  frontmatter: Frontmatter;
  href: string;
};

const CONTENT_ROOTS = [
  path.join(process.cwd(), "apps", "docs", "content"),
  path.join(process.cwd(), "content"),
];

const FRONTMATTER_REGEX = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
const H1_REGEX = /^#\s+(.+)$/m;

const normalizeSlug = (slug: string[]): string[] => {
  if (slug.length === 0) return ["index"];
  if (slug.length === 1 && slug[0] === "") return ["index"];
  return slug;
};

const parseFrontmatterBlock = (block: string): Frontmatter => {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const frontmatter: Frontmatter = {};

  for (const line of lines) {
    const [rawKey, ...rawValueParts] = line.split(":");
    if (!rawKey || rawValueParts.length === 0) continue;

    const key = rawKey.trim().toLowerCase();
    const value = rawValueParts
      .join(":")
      .trim()
      .replace(/^['"]|['"]$/g, "");

    switch (key) {
      case "title":
        frontmatter.title = value;
        break;
      case "description":
        frontmatter.description = value;
        break;
      case "category":
        frontmatter.category = value;
        break;
      case "icon":
        frontmatter.icon = value;
        break;
      case "order": {
        const parsed = Number(value);
        frontmatter.order = Number.isFinite(parsed) ? parsed : undefined;
        break;
      }
      default:
        break;
    }
  }

  return frontmatter;
};

const buildDocEntry = (root: string, relativePath: string): DocEntry => {
  const filePath = path.join(root, relativePath);
  const source = fs.readFileSync(filePath, "utf8");
  const frontmatterMatch = source.match(FRONTMATTER_REGEX);
  const frontmatterBlock = frontmatterMatch?.[1] ?? "";
  const frontmatter = parseFrontmatterBlock(frontmatterBlock);

  const body = frontmatterMatch
    ? source.slice(frontmatterMatch[0].length)
    : source;

  const slugPath = relativePath.replace(/\\/g, "/").replace(/\.mdx$/, "");
  const slug = slugPath.split("/");
  const href = slugPath === "index" ? "/" : `/${slugPath}`;

  return { slug, source, body, frontmatter, href };
};

const walkContentDir = (root: string, dir = ""): DocEntry[] => {
  const dirPath = path.join(root, dir);
  if (!fs.existsSync(dirPath)) return [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const items: DocEntry[] = [];

  for (const entry of entries) {
    const relPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      items.push(...walkContentDir(root, relPath));
    } else if (entry.name.endsWith(".mdx")) {
      items.push(buildDocEntry(root, relPath));
    }
  }

  return items;
};

const buildManifest = (): DocEntry[] => {
  const manifest: DocEntry[] = [];
  const seen = new Set<string>();

  for (const root of CONTENT_ROOTS) {
    if (!fs.existsSync(root)) continue;

    const entries = walkContentDir(root);
    for (const entry of entries) {
      const key = entry.slug.join("/");
      if (seen.has(key)) continue;
      seen.add(key);
      manifest.push(entry);
    }
  }

  return manifest;
};

const DOCS_MANIFEST = buildManifest();
const DOCS_MANIFEST_BY_SLUG = new Map(
  DOCS_MANIFEST.map((entry) => [entry.slug.join("/"), entry]),
);

export const getDocEntry = (slug: string[]): DocEntry | null => {
  const key = normalizeSlug(slug).join("/");
  return DOCS_MANIFEST_BY_SLUG.get(key) ?? null;
};

export const readMdxFileContent = async (slug: string[]): Promise<string> => {
  return getDocEntry(slug)?.source ?? "";
};

export const getMdxFrontmatter = async (
  slug: string[],
): Promise<Frontmatter> => {
  return getDocEntry(slug)?.frontmatter ?? {};
};

export const getDocsNavItems = async (): Promise<DocNavItem[]> => {
  const items = DOCS_MANIFEST.map((entry) => ({
    title:
      entry.frontmatter.title ??
      entry.slug[entry.slug.length - 1]?.replace(/-/g, " ") ??
      "Page",
    href: entry.href,
    description: entry.frontmatter.description,
    icon: entry.frontmatter.icon,
    category: entry.frontmatter.category,
    order: entry.frontmatter.order,
  }));

  return items.sort(
    (a, b) =>
      (a.order ?? Infinity) - (b.order ?? Infinity) ||
      (a.category ?? "").localeCompare(b.category ?? "") ||
      a.title.localeCompare(b.title),
  );
};

export const getPageImage = (slug: string[]) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://docs.simplist.blog";
  return {
    segments: [...slug, "image.png"],
    url: `${baseUrl}/og/${[...slug, "image.png"].join("/")}`,
  };
};

export const getDocBody = (slug: string[]): string => {
  return getDocEntry(slug)?.body ?? "";
};

export const getDocTitleFromBody = (body: string): string | null => {
  const match = body.match(H1_REGEX);
  return match ? match[1] : null;
};
