"use client";

import {
  Code,
  FileCode,
  Heading1,
  Heading2,
  Heading3,
  Link,
  ListCheck,
  ListOl,
  ListUl,
  Minus,
  Picture,
  QuoteOpen,
} from "@gravity-ui/icons";
import { $createCodeNode } from "@lexical/code";
import { $createHorizontalRuleNode } from "@lexical/extension";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@simplist/ui/components/command";
import { Pilcrow } from "@simplist/ui/components/icons";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  TextNode,
} from "lexical";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type CategoryType = "basic" | "list" | "media" | "advanced";

class ComponentPickerOption extends MenuOption {
  title: string;
  description: string;
  icon: ReactNode;
  category: CategoryType;
  keywords: string[];
  onSelect: (queryString: string) => void;

  constructor(
    title: string,
    options: {
      description: string;
      icon: ReactNode;
      category: CategoryType;
      keywords?: string[];
      onSelect: (queryString: string) => void;
    },
  ) {
    super(title);
    this.title = title;
    this.description = options.description;
    this.icon = options.icon;
    this.category = options.category;
    this.keywords = options.keywords || [];
    this.onSelect = options.onSelect;
  }
}

const CATEGORY_LABELS: Record<CategoryType, string> = {
  basic: "Basic Blocks",
  list: "Lists",
  media: "Media",
  advanced: "Advanced",
};

type ComponentPickerMenuPluginProps = {
  onInsertImage?: () => void;
  onInsertLink?: () => void;
};

export const ComponentPickerMenuPlugin = ({
  onInsertImage,
  onInsertLink,
}: ComponentPickerMenuPluginProps) => {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const baseOptions = useMemo(() => {
    return [
      // Basic Blocks
      new ComponentPickerOption("Paragraph", {
        description: "Plain text block",
        icon: <Pilcrow className="size-4" />,
        category: "basic",
        keywords: ["paragraph", "p", "text", "normal"],
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createParagraphNode());
            }
          });
        },
      }),
      new ComponentPickerOption("Heading 1", {
        description: "Large section heading",
        icon: <Heading1 className="size-4" />,
        category: "basic",
        keywords: ["heading", "h1", "title", "header"],
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode("h1"));
            }
          });
        },
      }),
      new ComponentPickerOption("Heading 2", {
        description: "Medium section heading",
        icon: <Heading2 className="size-4" />,
        category: "basic",
        keywords: ["heading", "h2", "subtitle"],
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode("h2"));
            }
          });
        },
      }),
      new ComponentPickerOption("Heading 3", {
        description: "Small section heading",
        icon: <Heading3 className="size-4" />,
        category: "basic",
        keywords: ["heading", "h3"],
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode("h3"));
            }
          });
        },
      }),
      new ComponentPickerOption("Quote", {
        description: "Capture a quote",
        icon: <QuoteOpen className="size-4" />,
        category: "basic",
        keywords: ["quote", "blockquote", "citation"],
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createQuoteNode());
            }
          });
        },
      }),

      // Lists
      new ComponentPickerOption("Bulleted List", {
        description: "Unordered list with bullets",
        icon: <ListUl className="size-4" />,
        category: "list",
        keywords: ["bulleted list", "ul", "unordered", "bullet"],
        onSelect: () => {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        },
      }),
      new ComponentPickerOption("Numbered List", {
        description: "Ordered list with numbers",
        icon: <ListOl className="size-4" />,
        category: "list",
        keywords: ["numbered list", "ol", "ordered", "number"],
        onSelect: () => {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        },
      }),
      new ComponentPickerOption("Check List", {
        description: "Todo list with checkboxes",
        icon: <ListCheck className="size-4" />,
        category: "list",
        keywords: ["check list", "todo", "checkbox", "task"],
        onSelect: () => {
          editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
        },
      }),

      // Media
      ...(onInsertImage
        ? [
            new ComponentPickerOption("Image", {
              description: "Upload or embed an image",
              icon: <Picture className="size-4" />,
              category: "media",
              keywords: ["image", "photo", "picture", "img"],
              onSelect: () => {
                onInsertImage();
              },
            }),
          ]
        : []),
      ...(onInsertLink
        ? [
            new ComponentPickerOption("Link", {
              description: "Insert a hyperlink",
              icon: <Link className="size-4" />,
              category: "media",
              keywords: ["link", "url", "href"],
              onSelect: () => {
                onInsertLink();
              },
            }),
          ]
        : []),

      // Advanced
      new ComponentPickerOption("Code Block", {
        description: "Multi-line code snippet",
        icon: <FileCode className="size-4" />,
        category: "advanced",
        keywords: ["code", "block", "codeblock", "snippet"],
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createCodeNode());
            }
          });
        },
      }),
      new ComponentPickerOption("Inline Code", {
        description: "Inline code formatting",
        icon: <Code className="size-4" />,
        category: "advanced",
        keywords: ["inline", "code"],
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.formatText("code");
            }
          });
        },
      }),
      new ComponentPickerOption("Divider", {
        description: "Horizontal separator line",
        icon: <Minus className="size-4" />,
        category: "advanced",
        keywords: ["divider", "hr", "horizontal", "rule", "line"],
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const nodes = selection.getNodes();
              const hrNode = $createHorizontalRuleNode();

              if (nodes.length === 0) {
                selection.insertNodes([hrNode]);
              } else {
                const firstNode = nodes[0];
                const topLevelElement = firstNode.getTopLevelElement();
                if (topLevelElement) {
                  topLevelElement.insertAfter(hrNode);
                } else {
                  selection.insertNodes([hrNode]);
                }
              }
            }
          });
        },
      }),
    ];
  }, [editor, onInsertImage, onInsertLink]);

  const options = useMemo(() => {
    if (!queryString) {
      return baseOptions;
    }

    const regex = new RegExp(queryString, "i");

    return baseOptions.filter(
      (option) =>
        regex.test(option.title) ||
        regex.test(option.description) ||
        option.keywords.some((keyword) => regex.test(keyword)),
    );
  }, [baseOptions, queryString]);

  // Group options by category
  const groupedOptions = useMemo(() => {
    const groups: Record<CategoryType, ComponentPickerOption[]> = {
      basic: [],
      list: [],
      media: [],
      advanced: [],
    };

    options.forEach((option) => {
      groups[option.category].push(option);
    });

    return groups;
  }, [options]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        nodeToRemove?.remove();
        selectedOption.onSelect(queryString || "");
        closeMenu();
      });
    },
    [editor, queryString],
  );

  return (
    <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) => {
        const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

        // Scroll to selected item when selectedIndex changes
        useEffect(() => {
          if (selectedIndex !== null) {
            const selectedElement = itemRefs.current.get(selectedIndex);
            if (selectedElement) {
              selectedElement.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
              });
            }
          }
        }, [selectedIndex]);

        return anchorElementRef.current && options.length > 0
          ? createPortal(
              <div className="bg-popover absolute z-50 mt-1 max-h-[400px] w-[280px] rounded-md border p-0 shadow-md">
                <Command>
                  <CommandList className="max-h-[380px] overflow-y-auto">
                    {(["basic", "list", "media", "advanced"] as CategoryType[])
                      .filter((category) => groupedOptions[category].length > 0)
                      .map((category, categoryIndex, filteredCategories) => (
                        <div key={category}>
                          <CommandGroup heading={CATEGORY_LABELS[category]}>
                            {groupedOptions[category].map((option) => {
                              const globalIndex = options.findIndex(
                                (o) => o.key === option.key,
                              );
                              return (
                                <CommandItem
                                  key={option.key}
                                  value={option.title}
                                  ref={(el) => {
                                    if (el) {
                                      itemRefs.current.set(globalIndex, el);
                                    } else {
                                      itemRefs.current.delete(globalIndex);
                                    }
                                  }}
                                  onSelect={() => {
                                    selectOptionAndCleanUp(option);
                                  }}
                                  onMouseEnter={() => {
                                    setHighlightedIndex(globalIndex);
                                  }}
                                  className={`flex cursor-pointer items-start gap-3 py-2 ${
                                    selectedIndex === globalIndex
                                      ? "bg-accent"
                                      : "bg-transparent"
                                  }`}
                                >
                                  <div className="mt-0.5">{option.icon}</div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-medium">
                                      {option.title}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                      {option.description}
                                    </span>
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                          {categoryIndex < filteredCategories.length - 1 && (
                            <CommandSeparator />
                          )}
                        </div>
                      ))}
                  </CommandList>
                </Command>
              </div>,
              anchorElementRef.current,
            )
          : null;
      }}
    />
  );
};
