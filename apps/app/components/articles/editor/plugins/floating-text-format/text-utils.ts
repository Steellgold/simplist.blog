import type { TextNode, LexicalNode } from "lexical";
import { $createTextNode } from "lexical";
import { $createLinkNode } from "@lexical/link";

/**
 * Convert a TextNode to markdown-formatted text based on its format flags
 */
export const textNodeToMarkdown = (node: TextNode): string => {
  let text = node.getTextContent();

  // Apply markdown formatting based on node format
  if (node.hasFormat("bold")) {
    text = `**${text}**`;
  }
  if (node.hasFormat("italic")) {
    text = `*${text}*`;
  }
  if (node.hasFormat("strikethrough")) {
    text = `~~${text}~~`;
  }
  if (node.hasFormat("code")) {
    text = `\`${text}\``;
  }
  if (node.hasFormat("underline")) {
    text = `__${text}__`;
  }

  return text;
};

/**
 * Parse markdown text and create formatted TextNodes and LinkNodes
 * Supports: **bold**, *italic*, ~~strike~~, `code`, __underline__, [links](url)
 */
export const parseMarkdownToNodes = (text: string): LexicalNode[] => {
  const nodes: LexicalNode[] = [];

  // Match patterns: [link](url), **bold**, *italic*, ~~strike~~, `code`, __underline__
  const regex =
    /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\~\~([^~]+)\~\~)|(\`([^`]+)\`)|(__([^_]+)__)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      const plainText = text.substring(lastIndex, match.index);
      if (plainText) {
        nodes.push($createTextNode(plainText));
      }
    }

    // Add formatted node
    if (match[1]) {
      // [link](url)
      const linkText = match[2];
      const url = match[3];
      const linkNode = $createLinkNode(url);

      // Parse the link text for formatting (e.g., [**bold text**](url))
      const linkContentNodes = parseMarkdownToTextNodesRecursive(linkText);
      for (const part of linkContentNodes) {
        const textNode = $createTextNode(part.text);
        if (part.formats > 0) {
          textNode.setFormat(part.formats);
        }
        linkNode.append(textNode);
      }

      nodes.push(linkNode);
    } else if (match[4]) {
      // **bold**
      const textNode = $createTextNode(match[5]);
      textNode.setFormat(1); // bold = 1
      nodes.push(textNode);
    } else if (match[6]) {
      // *italic*
      const textNode = $createTextNode(match[7]);
      textNode.setFormat(2); // italic = 2
      nodes.push(textNode);
    } else if (match[8]) {
      // ~~strikethrough~~
      const textNode = $createTextNode(match[9]);
      textNode.setFormat(8); // strikethrough = 8
      nodes.push(textNode);
    } else if (match[10]) {
      // `code`
      const textNode = $createTextNode(match[11]);
      textNode.setFormat(16); // code = 16
      nodes.push(textNode);
    } else if (match[12]) {
      // __underline__
      const textNode = $createTextNode(match[13]);
      textNode.setFormat(4); // underline = 4
      nodes.push(textNode);
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const plainText = text.substring(lastIndex);
    if (plainText) {
      nodes.push($createTextNode(plainText));
    }
  }

  // If no markdown found, just use plain text
  if (nodes.length === 0) {
    nodes.push($createTextNode(text));
  }

  return nodes;
};

/**
 * Helper function to parse text formatting (without links) for use inside links
 */
const parseMarkdownToTextNodesRecursive = (
  text: string,
): Array<{ text: string; formats: number }> => {
  const parts: Array<{ text: string; formats: number }> = [];

  // Match patterns: **bold**, *italic*, ~~strike~~, `code`, __underline__ (NO links)
  const regex =
    /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\~\~([^~]+)\~\~)|(\`([^`]+)\`)|(__([^_]+)__)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plainText = text.substring(lastIndex, match.index);
      if (plainText) {
        parts.push({ text: plainText, formats: 0 });
      }
    }

    if (match[1]) {
      parts.push({ text: match[2], formats: 1 }); // bold
    } else if (match[3]) {
      parts.push({ text: match[4], formats: 2 }); // italic
    } else if (match[5]) {
      parts.push({ text: match[6], formats: 8 }); // strikethrough
    } else if (match[7]) {
      parts.push({ text: match[8], formats: 16 }); // code
    } else if (match[9]) {
      parts.push({ text: match[10], formats: 4 }); // underline
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    const plainText = text.substring(lastIndex);
    if (plainText) {
      parts.push({ text: plainText, formats: 0 });
    }
  }

  if (parts.length === 0) {
    parts.push({ text, formats: 0 });
  }

  return parts;
};

/**
 * Parse markdown text and create formatted TextNodes (legacy function for backward compatibility)
 * Use parseMarkdownToNodes for full support including links
 */
export const parseMarkdownToTextNodes = (
  text: string,
): Array<{ text: string; formats: number }> => {
  return parseMarkdownToTextNodesRecursive(text);
};

/**
 * Create Lexical TextNodes from parsed markdown parts
 */
export const createTextNodesFromParts = (
  parts: Array<{ text: string; formats: number }>,
): TextNode[] => {
  return parts.map((part) => {
    const textNode = $createTextNode(part.text);
    if (part.formats > 0) {
      textNode.setFormat(part.formats);
    }
    return textNode;
  });
};
