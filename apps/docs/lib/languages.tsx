import { JavaScript, JSON, MarkdownDark, MarkdownLight, TypeScript, HTML5, CSS, Python, BashDark } from "@ridemountainpig/svgl-react"
import { IconThemed } from "@simplist/ui/components/icon-themed"

export const languages = [
  { label: "TypeScript", value: "typescript", icon: <TypeScript className="size-4" /> },
  { label: "JavaScript", value: "javascript", icon: <JavaScript className="size-4" /> },
  { label: "JSON", value: "json", icon: <JSON className="size-4" /> },
  { label: "HTML", value: "html", icon: <HTML5 className="size-4" /> },
  { label: "CSS", value: "css", icon: <CSS className="size-4" /> },
  { label: "Python", value: "python", icon: <Python className="size-4" /> },
  { label: "Bash", value: "bash", icon: <BashDark className="size-4" /> },
  { label: "Markdown", value: "markdown", icon: <IconThemed light={<MarkdownLight className="size-4" />} dark={<MarkdownDark className="size-4" />} /> }
]