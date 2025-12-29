"use client";

import type { EmojiMartData } from "@emoji-mart/data";
import data from "@emoji-mart/data";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@simplist/ui/components/command";
import { cn } from "@simplist/ui/lib/utils";
import { $getSelection, $isRangeSelection, TextNode } from "lexical";
import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type EmojiOption = MenuOption & {
  emoji: string;
  label: string;
};

const MAX_RESULTS = 10;

export function EmojiPickerPlugin() {
  const [editor] = useLexicalComposerContext();
  const [query, setQuery] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const trigger = useBasicTypeaheadTriggerMatch(":", { minLength: 1 });

  const options = useMemo<EmojiOption[]>(() => {
    if (!query) return [];

    const q = query.toLowerCase();
    const results: EmojiOption[] = [];

    for (const category of (data as EmojiMartData).categories) {
      for (const id of category.emojis) {
        if (results.length >= MAX_RESULTS) return results;

        const emoji = (data as EmojiMartData).emojis[id];
        if (!emoji) continue;

        const match =
          emoji.id.includes(q) ||
          emoji.name?.toLowerCase().includes(q) ||
          emoji.keywords?.some((k) => k.includes(q));

        if (!match) continue;

        results.push({
          key: emoji.id,
          emoji: emoji.skins?.[0]?.native ?? id,
          label: emoji.id,
        } as EmojiOption);
      }
    }

    return results;
  }, [query]);

  const onSelect = useCallback(
    (option: EmojiOption, node: TextNode | null, close: () => void) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        node?.remove();
        selection.insertText(option.emoji);
        close();
      });
    },
    [editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin
      onQueryChange={setQuery}
      triggerFn={trigger}
      options={options}
      onSelectOption={onSelect}
      menuRenderFn={(
        anchorRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) =>
        anchorRef.current && options.length
          ? createPortal(
              <div className="bg-popover absolute z-50 mt-1 w-56 rounded-md border shadow-md">
                <Command>
                  <CommandList
                    ref={containerRef}
                    className="max-h-96 overflow-auto"
                  >
                    <CommandGroup>
                      {options.map((opt, i) => (
                        <CommandItem
                          key={opt.key}
                          value={opt.label}
                          data-selected={i === selectedIndex}
                          onSelect={() => selectOptionAndCleanUp(opt)}
                          onMouseEnter={() => setHighlightedIndex(i)}
                          className={cn(
                            "cursor-pointer",
                            i === selectedIndex ? "bg-accent" : "",
                          )}
                        >
                          <span
                            className={cn("bg-foreground/10 rounded-md p-0.5", {
                              "bg-card": i === selectedIndex,
                            })}
                          >
                            {opt.emoji}
                          </span>

                          <span
                            className={cn(
                              "text-muted-foreground",
                              i === selectedIndex && "text-foreground",
                            )}
                          >
                            :{opt.label}:
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>,
              anchorRef.current,
            )
          : null
      }
    />
  );
}
