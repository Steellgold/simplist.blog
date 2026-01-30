import type { EditorThemeClasses } from "lexical";

export const editorTheme: EditorThemeClasses = {
  // Block-level elements
  heading: {
    h1: "text-4xl font-bold mt-6 mb-4",
    h2: "text-3xl font-bold mt-5 mb-3",
    h3: "text-2xl font-bold mt-4 mb-2",
    h4: "text-xl font-bold mt-3 mb-2",
    h5: "text-lg font-bold mt-2 mb-1",
    h6: "text-base font-bold mt-2 mb-1",
  },
  paragraph: "mb-2 leading-relaxed",
  quote:
    "border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground my-4",

  // Lists
  list: {
    ul: "list-disc list-inside my-2 space-y-1",
    ol: "list-decimal list-inside my-2 space-y-1",
    listitem: "ml-4",
    nested: {
      listitem: "ml-8",
    },
    checklist: "list-none my-2 space-y-1",
    listitemChecked:
      "line-through text-muted-foreground ml-0 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-green-500",
    listitemUnchecked:
      "ml-0 relative pl-6 before:content-['○'] before:absolute before:left-0 before:text-muted-foreground",
  },

  // Code
  code: "bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground",
  codeHighlight: {
    atrule: "text-purple-500",
    attr: "text-yellow-500",
    boolean: "text-purple-500",
    builtin: "text-cyan-500",
    cdata: "text-gray-500",
    char: "text-green-500",
    class: "text-yellow-500",
    "class-name": "text-yellow-500",
    comment: "text-gray-500 italic",
    constant: "text-purple-500",
    deleted: "text-red-500",
    doctype: "text-gray-500",
    entity: "text-red-500",
    function: "text-blue-500",
    important: "text-red-500 font-bold",
    inserted: "text-green-500",
    keyword: "text-purple-500",
    namespace: "text-gray-500",
    number: "text-orange-500",
    operator: "text-gray-500",
    prolog: "text-gray-500",
    property: "text-blue-500",
    punctuation: "text-gray-500",
    regex: "text-red-500",
    selector: "text-green-500",
    string: "text-green-500",
    symbol: "text-purple-500",
    tag: "text-red-500",
    url: "text-cyan-500",
    variable: "text-red-500",
  },

  // Text formatting
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    underlineStrikethrough: "underline line-through",
    code: "bg-muted px-1.5 py-0.5 rounded text-sm font-mono",
    subscript: "text-xs align-sub",
    superscript: "text-xs align-super",
  },

  // Links
  link: "text-primary underline hover:text-primary/80 cursor-pointer",

  // Horizontal rule
  hr: "border-t border-border my-6",

  // Images
  image: "max-w-full h-auto rounded-lg my-4",

  // Root
  root: "outline-none",

  // Decorators
  embedBlock: {
    base: "my-4",
    focus: "ring-2 ring-primary ring-offset-2",
  },
};
