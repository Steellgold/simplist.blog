"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
} from "@lexical/list";
import { $createCodeNode } from "@lexical/code";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  TextNode,
} from "lexical";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/extension";
import { createPortal } from "react-dom";
import {
  Code,
  FileCode2,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Link,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
} from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@simplist/ui/components/command";

class ComponentPickerOption extends MenuOption {
  title: string;
  icon: ReactNode;
  keywords: string[];
  onSelect: (queryString: string) => void;

  constructor(
    title: string,
    options: {
      icon: ReactNode;
      keywords?: string[];
      onSelect: (queryString: string) => void;
    },
  ) {
    super(title);
    this.title = title;
    this.icon = options.icon;
    this.keywords = options.keywords || [];
    this.onSelect = options.onSelect;
  }
}

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
      new ComponentPickerOption("Paragraph", {
        icon: <Pilcrow className="size-4" />,
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
        icon: <Heading1 className="size-4" />,
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
        icon: <Heading2 className="size-4" />,
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
        icon: <Heading3 className="size-4" />,
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
      new ComponentPickerOption("Bulleted List", {
        icon: <List className="size-4" />,
        keywords: ["bulleted list", "ul", "unordered", "bullet"],
        onSelect: () => {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        },
      }),
      new ComponentPickerOption("Numbered List", {
        icon: <ListOrdered className="size-4" />,
        keywords: ["numbered list", "ol", "ordered", "number"],
        onSelect: () => {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        },
      }),
      new ComponentPickerOption("Check List", {
        icon: <ListChecks className="size-4" />,
        keywords: ["check list", "todo", "checkbox", "task"],
        onSelect: () => {
          editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
        },
      }),
      new ComponentPickerOption("Quote", {
        icon: <Quote className="size-4" />,
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
      new ComponentPickerOption("Code Block", {
        icon: <FileCode2 className="size-4" />,
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
        icon: <Code className="size-4" />,
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
        icon: <Minus className="size-4" />,
        keywords: ["divider", "hr", "horizontal", "rule", "line"],
        onSelect: () => {
          editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
        },
      }),
      ...(onInsertImage
        ? [
            new ComponentPickerOption("Image", {
              icon: <ImageIcon className="size-4" />,
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
              icon: <Link className="size-4" />,
              keywords: ["link", "url", "href"],
              onSelect: () => {
                onInsertLink();
              },
            }),
          ]
        : []),
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
        option.keywords.some((keyword) => regex.test(keyword)),
    );
  }, [baseOptions, queryString]);

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
      ) =>
        anchorElementRef.current && options.length > 0
          ? createPortal(
              <div className="bg-popover absolute z-50 mt-1 w-[220px] rounded-md border p-0 shadow-md">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {options.map((option, index) => (
                        <CommandItem
                          key={option.key}
                          value={option.title}
                          onSelect={() => {
                            selectOptionAndCleanUp(option);
                          }}
                          onMouseEnter={() => {
                            setHighlightedIndex(index);
                          }}
                          className={`flex cursor-pointer items-center gap-2 ${
                            selectedIndex === index
                              ? "bg-accent"
                              : "bg-transparent"
                          }`}
                        >
                          {option.icon}
                          <span>{option.title}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>,
              anchorElementRef.current,
            )
          : null
      }
    />
  );
};
