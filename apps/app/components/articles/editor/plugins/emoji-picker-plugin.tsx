"use client";

import { useCallback, useMemo, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { TextNode, $getSelection, $isRangeSelection } from "lexical";
import { createPortal } from "react-dom";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@simplist/ui/components/command";

// Emoji data with shortcodes
const EMOJI_LIST: Array<{ emoji: string; shortcodes: string[] }> = [
  // Smileys & Emotion
  { emoji: "😀", shortcodes: ["grinning", "grin"] },
  { emoji: "😃", shortcodes: ["smiley"] },
  { emoji: "😄", shortcodes: ["smile"] },
  { emoji: "😁", shortcodes: ["grin", "beaming"] },
  { emoji: "😆", shortcodes: ["laughing", "satisfied", "lol"] },
  { emoji: "😅", shortcodes: ["sweat_smile"] },
  { emoji: "🤣", shortcodes: ["rofl", "rolling_on_the_floor_laughing"] },
  { emoji: "😂", shortcodes: ["joy", "tears_of_joy"] },
  { emoji: "🙂", shortcodes: ["slightly_smiling_face", "slight_smile"] },
  { emoji: "🙃", shortcodes: ["upside_down_face", "upside_down"] },
  { emoji: "😉", shortcodes: ["wink"] },
  { emoji: "😊", shortcodes: ["blush"] },
  { emoji: "😇", shortcodes: ["innocent", "angel"] },
  { emoji: "🥰", shortcodes: ["smiling_face_with_hearts", "in_love"] },
  { emoji: "😍", shortcodes: ["heart_eyes"] },
  { emoji: "🤩", shortcodes: ["star_struck", "starry_eyes"] },
  { emoji: "😘", shortcodes: ["kissing_heart"] },
  { emoji: "😗", shortcodes: ["kissing"] },
  { emoji: "😚", shortcodes: ["kissing_closed_eyes"] },
  { emoji: "😙", shortcodes: ["kissing_smiling_eyes"] },
  { emoji: "🥲", shortcodes: ["smiling_face_with_tear"] },
  { emoji: "😋", shortcodes: ["yum", "delicious"] },
  { emoji: "😛", shortcodes: ["stuck_out_tongue"] },
  { emoji: "😜", shortcodes: ["stuck_out_tongue_winking_eye", "crazy"] },
  { emoji: "🤪", shortcodes: ["zany_face", "crazy_face"] },
  { emoji: "😝", shortcodes: ["stuck_out_tongue_closed_eyes"] },
  { emoji: "🤑", shortcodes: ["money_mouth_face", "money"] },
  { emoji: "🤗", shortcodes: ["hugs", "hugging"] },
  { emoji: "🤭", shortcodes: ["hand_over_mouth"] },
  { emoji: "🤫", shortcodes: ["shushing_face", "shh"] },
  { emoji: "🤔", shortcodes: ["thinking", "thinking_face"] },
  { emoji: "🤐", shortcodes: ["zipper_mouth_face", "zip"] },
  { emoji: "🤨", shortcodes: ["raised_eyebrow"] },
  { emoji: "😐", shortcodes: ["neutral_face", "neutral"] },
  { emoji: "😑", shortcodes: ["expressionless"] },
  { emoji: "😶", shortcodes: ["no_mouth"] },
  { emoji: "😏", shortcodes: ["smirk"] },
  { emoji: "😒", shortcodes: ["unamused"] },
  { emoji: "🙄", shortcodes: ["roll_eyes", "eye_roll"] },
  { emoji: "😬", shortcodes: ["grimacing"] },
  { emoji: "🤥", shortcodes: ["lying_face", "liar"] },
  { emoji: "😌", shortcodes: ["relieved"] },
  { emoji: "😔", shortcodes: ["pensive"] },
  { emoji: "😪", shortcodes: ["sleepy"] },
  { emoji: "🤤", shortcodes: ["drooling_face", "drool"] },
  { emoji: "😴", shortcodes: ["sleeping", "zzz"] },
  { emoji: "😷", shortcodes: ["mask"] },
  { emoji: "🤒", shortcodes: ["face_with_thermometer", "sick"] },
  { emoji: "🤕", shortcodes: ["face_with_head_bandage", "hurt"] },
  { emoji: "🤢", shortcodes: ["nauseated_face", "sick"] },
  { emoji: "🤮", shortcodes: ["vomiting_face", "puke"] },
  { emoji: "🤧", shortcodes: ["sneezing_face", "sneeze"] },
  { emoji: "🥵", shortcodes: ["hot_face", "hot"] },
  { emoji: "🥶", shortcodes: ["cold_face", "cold", "freezing"] },
  { emoji: "🥴", shortcodes: ["woozy_face", "drunk"] },
  { emoji: "😵", shortcodes: ["dizzy_face", "dizzy"] },
  { emoji: "🤯", shortcodes: ["exploding_head", "mind_blown"] },
  { emoji: "🤠", shortcodes: ["cowboy_hat_face", "cowboy"] },
  { emoji: "🥳", shortcodes: ["partying_face", "party"] },
  { emoji: "🥸", shortcodes: ["disguised_face", "disguise"] },
  { emoji: "😎", shortcodes: ["sunglasses", "cool"] },
  { emoji: "🤓", shortcodes: ["nerd_face", "nerd"] },
  { emoji: "🧐", shortcodes: ["monocle_face", "monocle"] },
  { emoji: "😕", shortcodes: ["confused"] },
  { emoji: "😟", shortcodes: ["worried"] },
  { emoji: "🙁", shortcodes: ["slightly_frowning_face", "frown"] },
  { emoji: "☹️", shortcodes: ["frowning_face"] },
  { emoji: "😮", shortcodes: ["open_mouth", "surprised"] },
  { emoji: "😯", shortcodes: ["hushed"] },
  { emoji: "😲", shortcodes: ["astonished"] },
  { emoji: "😳", shortcodes: ["flushed"] },
  { emoji: "🥺", shortcodes: ["pleading_face", "puppy_eyes"] },
  { emoji: "😦", shortcodes: ["frowning"] },
  { emoji: "😧", shortcodes: ["anguished"] },
  { emoji: "😨", shortcodes: ["fearful"] },
  { emoji: "😰", shortcodes: ["cold_sweat"] },
  { emoji: "😥", shortcodes: ["disappointed_relieved", "sad_relieved"] },
  { emoji: "😢", shortcodes: ["cry", "crying"] },
  { emoji: "😭", shortcodes: ["sob", "crying_loudly"] },
  { emoji: "😱", shortcodes: ["scream", "scared"] },
  { emoji: "😖", shortcodes: ["confounded"] },
  { emoji: "😣", shortcodes: ["persevere"] },
  { emoji: "😞", shortcodes: ["disappointed", "sad"] },
  { emoji: "😓", shortcodes: ["sweat"] },
  { emoji: "😩", shortcodes: ["weary"] },
  { emoji: "😫", shortcodes: ["tired_face", "tired"] },
  { emoji: "🥱", shortcodes: ["yawning_face", "yawn"] },
  { emoji: "😤", shortcodes: ["triumph", "huff"] },
  { emoji: "😡", shortcodes: ["rage", "angry"] },
  { emoji: "😠", shortcodes: ["angry"] },
  { emoji: "🤬", shortcodes: ["cursing_face", "swearing"] },
  { emoji: "😈", shortcodes: ["smiling_imp", "devil"] },
  { emoji: "👿", shortcodes: ["imp", "angry_devil"] },
  { emoji: "💀", shortcodes: ["skull", "dead"] },
  { emoji: "☠️", shortcodes: ["skull_and_crossbones"] },
  { emoji: "💩", shortcodes: ["poop", "shit"] },
  { emoji: "🤡", shortcodes: ["clown_face", "clown"] },
  { emoji: "👹", shortcodes: ["japanese_ogre", "ogre"] },
  { emoji: "👺", shortcodes: ["japanese_goblin", "goblin"] },
  { emoji: "👻", shortcodes: ["ghost"] },
  { emoji: "👽", shortcodes: ["alien"] },
  { emoji: "👾", shortcodes: ["space_invader"] },
  { emoji: "🤖", shortcodes: ["robot"] },

  // Gestures
  { emoji: "👍", shortcodes: ["thumbsup", "thumbs_up", "+1", "yes"] },
  { emoji: "👎", shortcodes: ["thumbsdown", "thumbs_down", "-1", "no"] },
  { emoji: "👏", shortcodes: ["clap", "applause"] },
  { emoji: "🙌", shortcodes: ["raised_hands", "hooray"] },
  { emoji: "🤝", shortcodes: ["handshake"] },
  { emoji: "🙏", shortcodes: ["pray", "please", "thanks"] },
  { emoji: "✌️", shortcodes: ["v", "peace", "victory"] },
  { emoji: "🤞", shortcodes: ["crossed_fingers", "fingers_crossed"] },
  { emoji: "🤟", shortcodes: ["love_you_gesture", "ily"] },
  { emoji: "🤘", shortcodes: ["metal", "rock"] },
  { emoji: "🤙", shortcodes: ["call_me_hand", "shaka"] },
  { emoji: "👋", shortcodes: ["wave", "hello", "bye"] },
  { emoji: "🖐️", shortcodes: ["raised_hand_with_fingers_splayed"] },
  { emoji: "✋", shortcodes: ["hand", "raised_hand", "stop"] },
  { emoji: "🖖", shortcodes: ["vulcan_salute", "spock"] },
  { emoji: "👌", shortcodes: ["ok_hand", "ok"] },
  { emoji: "🤌", shortcodes: ["pinched_fingers", "italian"] },
  { emoji: "✍️", shortcodes: ["writing_hand", "writing"] },
  { emoji: "💪", shortcodes: ["muscle", "strong", "flex"] },

  // Hearts & Love
  { emoji: "❤️", shortcodes: ["heart", "love", "red_heart"] },
  { emoji: "🧡", shortcodes: ["orange_heart"] },
  { emoji: "💛", shortcodes: ["yellow_heart"] },
  { emoji: "💚", shortcodes: ["green_heart"] },
  { emoji: "💙", shortcodes: ["blue_heart"] },
  { emoji: "💜", shortcodes: ["purple_heart"] },
  { emoji: "🖤", shortcodes: ["black_heart"] },
  { emoji: "🤍", shortcodes: ["white_heart"] },
  { emoji: "🤎", shortcodes: ["brown_heart"] },
  { emoji: "💔", shortcodes: ["broken_heart"] },
  { emoji: "💕", shortcodes: ["two_hearts"] },
  { emoji: "💞", shortcodes: ["revolving_hearts"] },
  { emoji: "💓", shortcodes: ["heartbeat"] },
  { emoji: "💗", shortcodes: ["heartpulse", "growing_heart"] },
  { emoji: "💖", shortcodes: ["sparkling_heart"] },
  { emoji: "💘", shortcodes: ["cupid"] },
  { emoji: "💝", shortcodes: ["gift_heart"] },
  { emoji: "💟", shortcodes: ["heart_decoration"] },

  // Symbols & Objects
  { emoji: "⭐", shortcodes: ["star"] },
  { emoji: "🌟", shortcodes: ["star2", "glowing_star"] },
  { emoji: "✨", shortcodes: ["sparkles", "stars"] },
  { emoji: "💥", shortcodes: ["boom", "collision", "explosion"] },
  { emoji: "🔥", shortcodes: ["fire", "hot", "lit"] },
  { emoji: "💯", shortcodes: ["100", "hundred"] },
  { emoji: "💢", shortcodes: ["anger"] },
  { emoji: "💬", shortcodes: ["speech_balloon", "comment"] },
  { emoji: "💭", shortcodes: ["thought_balloon", "thought"] },
  { emoji: "💤", shortcodes: ["zzz", "sleep"] },
  { emoji: "✅", shortcodes: ["white_check_mark", "check", "done"] },
  { emoji: "❌", shortcodes: ["x", "cross", "wrong"] },
  { emoji: "❓", shortcodes: ["question"] },
  { emoji: "❗", shortcodes: ["exclamation", "bang"] },
  { emoji: "⚠️", shortcodes: ["warning"] },
  { emoji: "🚀", shortcodes: ["rocket", "launch"] },
  { emoji: "🎉", shortcodes: ["tada", "party", "celebration"] },
  { emoji: "🎊", shortcodes: ["confetti_ball", "confetti"] },
  { emoji: "🎁", shortcodes: ["gift", "present"] },
  { emoji: "🏆", shortcodes: ["trophy", "winner"] },
  { emoji: "🎯", shortcodes: ["dart", "target", "bullseye"] },
  { emoji: "💡", shortcodes: ["bulb", "idea", "lightbulb"] },
  { emoji: "📌", shortcodes: ["pushpin", "pin"] },
  { emoji: "📝", shortcodes: ["memo", "note"] },
  { emoji: "📅", shortcodes: ["date", "calendar"] },
  { emoji: "⏰", shortcodes: ["alarm_clock"] },
  { emoji: "🔗", shortcodes: ["link"] },
  { emoji: "🔒", shortcodes: ["lock", "locked"] },
  { emoji: "🔓", shortcodes: ["unlock", "unlocked"] },
  { emoji: "🔑", shortcodes: ["key"] },
  { emoji: "🛠️", shortcodes: ["hammer_and_wrench", "tools"] },
  { emoji: "⚙️", shortcodes: ["gear", "settings"] },
  { emoji: "💻", shortcodes: ["computer", "laptop"] },
  { emoji: "📱", shortcodes: ["iphone", "phone", "mobile"] },
  { emoji: "📧", shortcodes: ["email", "e-mail"] },
  { emoji: "📁", shortcodes: ["file_folder", "folder"] },
  { emoji: "📂", shortcodes: ["open_file_folder"] },
  { emoji: "📊", shortcodes: ["bar_chart", "chart"] },
  { emoji: "📈", shortcodes: ["chart_with_upwards_trend", "graph_up"] },
  { emoji: "📉", shortcodes: ["chart_with_downwards_trend", "graph_down"] },

  // Nature
  { emoji: "☀️", shortcodes: ["sunny", "sun"] },
  { emoji: "🌙", shortcodes: ["crescent_moon", "moon"] },
  { emoji: "⚡", shortcodes: ["zap", "lightning", "thunder"] },
  { emoji: "🌈", shortcodes: ["rainbow"] },
  { emoji: "☁️", shortcodes: ["cloud"] },
  { emoji: "🌧️", shortcodes: ["cloud_with_rain", "rain"] },
  { emoji: "❄️", shortcodes: ["snowflake", "snow"] },
  { emoji: "🌸", shortcodes: ["cherry_blossom"] },
  { emoji: "🌹", shortcodes: ["rose"] },
  { emoji: "🌻", shortcodes: ["sunflower"] },
  { emoji: "🌴", shortcodes: ["palm_tree"] },
  { emoji: "🌲", shortcodes: ["evergreen_tree", "tree"] },
  { emoji: "🍀", shortcodes: ["four_leaf_clover", "lucky"] },

  // Food & Drink
  { emoji: "☕", shortcodes: ["coffee"] },
  { emoji: "🍵", shortcodes: ["tea"] },
  { emoji: "🍺", shortcodes: ["beer"] },
  { emoji: "🍻", shortcodes: ["beers", "cheers"] },
  { emoji: "🍷", shortcodes: ["wine_glass", "wine"] },
  { emoji: "🍕", shortcodes: ["pizza"] },
  { emoji: "🍔", shortcodes: ["hamburger", "burger"] },
  { emoji: "🍟", shortcodes: ["fries", "french_fries"] },
  { emoji: "🌮", shortcodes: ["taco"] },
  { emoji: "🍿", shortcodes: ["popcorn"] },
  { emoji: "🍩", shortcodes: ["doughnut", "donut"] },
  { emoji: "🍪", shortcodes: ["cookie"] },
  { emoji: "🎂", shortcodes: ["birthday", "cake"] },
  { emoji: "🍰", shortcodes: ["cake", "shortcake"] },

  // Animals
  { emoji: "🐶", shortcodes: ["dog"] },
  { emoji: "🐱", shortcodes: ["cat"] },
  { emoji: "🐭", shortcodes: ["mouse"] },
  { emoji: "🐰", shortcodes: ["rabbit", "bunny"] },
  { emoji: "🦊", shortcodes: ["fox_face", "fox"] },
  { emoji: "🐻", shortcodes: ["bear"] },
  { emoji: "🐼", shortcodes: ["panda_face", "panda"] },
  { emoji: "🐨", shortcodes: ["koala"] },
  { emoji: "🦁", shortcodes: ["lion", "lion_face"] },
  { emoji: "🐮", shortcodes: ["cow"] },
  { emoji: "🐷", shortcodes: ["pig"] },
  { emoji: "🐸", shortcodes: ["frog"] },
  { emoji: "🐵", shortcodes: ["monkey_face", "monkey"] },
  { emoji: "🐔", shortcodes: ["chicken"] },
  { emoji: "🦄", shortcodes: ["unicorn"] },
  { emoji: "🐝", shortcodes: ["bee", "honeybee"] },
  { emoji: "🦋", shortcodes: ["butterfly"] },
  { emoji: "🐢", shortcodes: ["turtle"] },
  { emoji: "🐍", shortcodes: ["snake"] },
  { emoji: "🦈", shortcodes: ["shark"] },
  { emoji: "🐙", shortcodes: ["octopus"] },

  // Activities & Sports
  { emoji: "⚽", shortcodes: ["soccer", "football"] },
  { emoji: "🏀", shortcodes: ["basketball"] },
  { emoji: "🎮", shortcodes: ["video_game", "gaming"] },
  { emoji: "🎲", shortcodes: ["game_die", "dice"] },
  { emoji: "🎵", shortcodes: ["musical_note", "music"] },
  { emoji: "🎶", shortcodes: ["notes", "music_notes"] },
  { emoji: "🎬", shortcodes: ["clapper", "movie"] },
  { emoji: "🎨", shortcodes: ["art", "palette"] },
  { emoji: "📸", shortcodes: ["camera_flash", "photo"] },
  { emoji: "🎤", shortcodes: ["microphone", "mic"] },

  // Misc
  { emoji: "👀", shortcodes: ["eyes", "look"] },
  { emoji: "👁️", shortcodes: ["eye"] },
  { emoji: "👂", shortcodes: ["ear"] },
  { emoji: "👃", shortcodes: ["nose"] },
  { emoji: "👄", shortcodes: ["lips", "mouth"] },
  { emoji: "👅", shortcodes: ["tongue"] },
  { emoji: "🧠", shortcodes: ["brain"] },
  { emoji: "🦷", shortcodes: ["tooth"] },
  { emoji: "🦴", shortcodes: ["bone"] },
  { emoji: "👶", shortcodes: ["baby"] },
  { emoji: "👦", shortcodes: ["boy"] },
  { emoji: "👧", shortcodes: ["girl"] },
  { emoji: "👨", shortcodes: ["man"] },
  { emoji: "👩", shortcodes: ["woman"] },
  { emoji: "👴", shortcodes: ["older_man", "grandpa"] },
  { emoji: "👵", shortcodes: ["older_woman", "grandma"] },
  { emoji: "🤷", shortcodes: ["shrug"] },
  { emoji: "🤦", shortcodes: ["facepalm"] },
  { emoji: "🙅", shortcodes: ["no_good", "ng"] },
  { emoji: "🙆", shortcodes: ["ok_woman", "ok_person"] },
  { emoji: "🙋", shortcodes: ["raising_hand"] },
  { emoji: "🙇", shortcodes: ["bow"] },
  { emoji: "💁", shortcodes: ["information_desk_person", "sassy"] },
];

class EmojiOption extends MenuOption {
  emoji: string;
  shortcode: string;

  constructor(emoji: string, shortcode: string) {
    super(shortcode);
    this.emoji = emoji;
    this.shortcode = shortcode;
  }
}

export const EmojiPickerPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch(":", {
    minLength: 1,
  });

  const options = useMemo(() => {
    if (!queryString) {
      return [];
    }

    const query = queryString.toLowerCase();
    const results: EmojiOption[] = [];

    for (const item of EMOJI_LIST) {
      for (const shortcode of item.shortcodes) {
        if (shortcode.includes(query)) {
          results.push(new EmojiOption(item.emoji, shortcode));
          break; // Only add once per emoji
        }
      }
      if (results.length >= 10) break; // Limit results
    }

    return results;
  }, [queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: EmojiOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || selectedOption === null) {
          return;
        }

        if (nodeToRemove) {
          nodeToRemove.remove();
        }

        selection.insertText(selectedOption.emoji);
        closeMenu();
      });
    },
    [editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin<EmojiOption>
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
                          value={option.shortcode}
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
                          <span className="text-lg">{option.emoji}</span>
                          <span className="text-muted-foreground text-sm">
                            :{option.shortcode}:
                          </span>
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
}
