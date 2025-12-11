import { JavaScript, JSON, MarkdownDark, MarkdownLight, TypeScript, HTML5, CSS, Python, BashDark, ReactDark, ReactLight } from "@ridemountainpig/svgl-react"
import { IconThemed } from "@simplist/ui/components/icon-themed"

export const languages = [
  { label: "TypeScript", value: "typescript", icon: <TypeScript className="size-3.5" /> },
  { label: "TypeScript", value: "tsx", icon: <IconThemed light={<ReactLight className="size-3.5" />} dark={<ReactDark className="size-3.5" />} /> },
  { label: "JavaScript", value: "javascript", icon: <JavaScript className="size-3.5" /> },
  { label: "JavaScript", value: "jsx", icon: <IconThemed light={<ReactLight className="size-3.5" />} dark={<ReactDark className="size-3.5" />} /> },
  { label: "JSON", value: "json", icon: <JSON className="size-3.5" /> },
  { label: "HTML", value: "html", icon: <HTML5 className="size-3.5" /> },
  { label: "CSS", value: "css", icon: <CSS className="size-3.5" /> },
  { label: "Python", value: "python", icon: <Python className="size-3.5" /> },
  { label: "Bash", value: "bash", icon: <BashDark className="size-3.5" /> },
  { label: "Markdown", value: "markdown", icon: <IconThemed light={<MarkdownLight className="size-3.5" />} dark={<MarkdownDark className="size-3.5" />} /> }
]