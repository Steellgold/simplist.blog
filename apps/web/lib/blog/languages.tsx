import {
  BashDark,
  CSS,
  HTML5,
  JavaScript,
  JSON,
  MarkdownLight,
  Python,
  ReactLight,
  TypeScript,
} from "@ridemountainpig/svgl-react";

export const languages = [
  {
    label: "TypeScript",
    value: "typescript",
    icon: <TypeScript className="size-3.5" />,
  },
  {
    label: "TypeScript",
    value: "tsx",
    icon: <ReactLight className="size-3.5" />,
  },
  {
    label: "JavaScript",
    value: "javascript",
    icon: <JavaScript className="size-3.5" />,
  },
  {
    label: "JavaScript",
    value: "jsx",
    icon: <ReactLight className="size-3.5" />,
  },
  { label: "JSON", value: "json", icon: <JSON className="size-3.5" /> },
  { label: "HTML", value: "html", icon: <HTML5 className="size-3.5" /> },
  { label: "CSS", value: "css", icon: <CSS className="size-3.5" /> },
  { label: "Python", value: "python", icon: <Python className="size-3.5" /> },
  { label: "Bash", value: "bash", icon: <BashDark className="size-3.5" /> },
  { label: "Bash", value: "shell", icon: <BashDark className="size-3.5" /> },
  {
    label: "Markdown",
    value: "markdown",
    icon: <MarkdownLight className="size-3.5" />,
  },
];
