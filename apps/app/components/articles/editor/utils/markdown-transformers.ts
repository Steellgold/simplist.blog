import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from "@lexical/extension";
import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
  type ElementTransformer,
  type TextMatchTransformer,
  type Transformer,
} from "@lexical/markdown";
import { $createTextNode } from "lexical";
import { $createImageNode, $isImageNode, ImageNode } from "../nodes/image-node";

// Horizontal rule transformer
export const HR: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node) => {
    return $isHorizontalRuleNode(node) ? "---" : null;
  },
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _1, _2, isImport) => {
    const line = $createHorizontalRuleNode();

    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }

    line.selectNext();
  },
  type: "element",
};

// Image transformer for markdown images ![alt](src)
export const IMAGE: ElementTransformer = {
  dependencies: [ImageNode as any],
  export: (node) => {
    if (!$isImageNode(node)) {
      return null;
    }
    const altText = node.getAltText() || "";
    const src = node.getSrc();
    return `![${altText}](${src})`;
  },
  regExp: /^!\[([^\]]*)\]\(([^)]+)\)\s*$/,
  replace: (parentNode, _children, match) => {
    const [, altText, src] = match;
    const imageNode = $createImageNode({
      src: src || "",
      altText: altText || "",
    });
    parentNode.replace(imageNode as any);
  },
  type: "element",
};

// Inline image transformer for images within text
export const INLINE_IMAGE: TextMatchTransformer = {
  dependencies: [ImageNode as any],
  export: (node) => {
    if (!$isImageNode(node)) {
      return null;
    }
    const altText = node.getAltText() || "";
    const src = node.getSrc();
    return `![${altText}](${src})`;
  },
  importRegExp: /!\[([^\]]*)\]\(([^)]+)\)/,
  regExp: /!\[([^\]]*)\]\(([^)]+)\)/,
  replace: (textNode, match) => {
    const [, altText, src] = match;
    const imageNode = $createImageNode({
      src: src || "",
      altText: altText || "",
    });
    textNode.replace(imageNode as any);
  },
  trigger: ")",
  type: "text-match",
};

// All transformers for editor
export const TRANSFORMERS: Array<Transformer> = [
  HR,
  IMAGE,
  INLINE_IMAGE,
  CHECK_LIST,
  ...ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
];
