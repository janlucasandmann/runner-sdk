import { useEffect, useMemo, useState } from "react";
import { SmilePlus } from "../../ui/hugeicons-compat.js";

import { PlatformIconButton } from "../../ui/icon-button/index.js";
import {
  PlatformPopup,
  PlatformPopupSearchHeader,
  type PlatformPopupProps,
} from "../popup/index.js";

const DEFAULT_FREQUENT_EMOJIS = [
  "😂", "👍", "👌", "🙏", "❤️", "👀", "✅", "🙂", "😀",
  "😁", "😄", "🤔", "😅", "⚠️", "☹️", "❌", "🙌", "🎉",
];

const PLATFORM_EMOJI_GROUPS = [
  {
    id: "smileys",
    label: "Smileys & People",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂",
      "🙃", "🫠", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘",
      "😗", "☺️", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪",
      "😝", "🤑", "🤗", "🤭", "🫢", "🫣", "🤫", "🤔", "🫡",
      "🤐", "🤨", "😐", "😑", "😶", "🫥", "😶‍🌫️", "😏", "😒",
      "🙄", "😬", "😮‍💨", "🤥", "🫨", "🙂‍↔️", "🙂‍↕️", "😌", "😔",
      "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧",
      "🥵", "🥶", "🥴", "😵", "😵‍💫", "🤯", "🤠", "🥳", "🥸",
      "😎", "🤓", "🧐", "😕", "🫤", "😟", "🙁", "☹️", "😮",
      "😯", "😲", "😳", "🥺", "🥹", "😦", "😧", "😨", "😰",
      "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩",
      "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀",
    ],
  },
  {
    id: "gestures",
    label: "People & Gestures",
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "🫱", "🫲", "🫳", "🫴",
      "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙",
      "👈", "👉", "👆", "👇", "☝️", "🫵", "👍", "👎", "✊",
      "👊", "🤛", "🤜", "👏", "🙌", "🫶", "👐", "🤲", "🤝",
      "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶",
    ],
  },
  {
    id: "symbols",
    label: "Symbols & Objects",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎",
      "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝",
      "✅", "❌", "⚠️", "❗", "❓", "💡", "🔥", "⭐", "✨",
      "🎉", "🎯", "🚀", "📌", "📎", "🔗", "📊", "📈", "📉",
      "🛠️", "⚙️", "🔒", "🔓", "💬", "🗨️", "📝", "📁", "📄",
    ],
  },
] as const;

const EMOJI_STORAGE_KEY = "computer-agents:emoji-picker:frequent";

const EMOJI_SEARCH_KEYWORDS: Record<string, string> = {
  "😂": "laugh laughing tears joy funny",
  "👍": "thumb up approve yes like",
  "👌": "ok okay perfect",
  "🙏": "pray please thanks thank you",
  "❤️": "heart love red",
  "👀": "eyes look watching",
  "✅": "check complete done yes",
  "🙂": "smile happy",
  "😀": "grin smile happy",
  "🤔": "thinking question consider",
  "⚠️": "warning caution",
  "☹️": "sad frown",
  "❌": "cross no cancel error",
  "🙌": "celebrate raised hands",
  "🎉": "party celebrate confetti",
  "🔥": "fire hot",
  "⭐": "star favorite",
  "✨": "sparkles",
  "🎯": "target goal",
  "🚀": "rocket launch",
  "📌": "pin",
  "📎": "attachment paperclip",
  "🔗": "link",
  "📊": "chart analytics",
  "📈": "growth chart up",
  "📉": "decline chart down",
  "🛠️": "tools work build",
  "⚙️": "settings gear",
  "🔒": "lock private secure",
  "🔓": "unlock public",
  "💬": "comment message chat",
  "📝": "note write",
  "📁": "folder",
  "📄": "file document",
};

function emojiMatchesQuery(emoji: string, query: string) {
  return emoji.includes(query)
    || (EMOJI_SEARCH_KEYWORDS[emoji] || "").includes(query);
}

function readStoredFrequentEmojis() {
  if (typeof window === "undefined") {
    return DEFAULT_FREQUENT_EMOJIS;
  }
  try {
    const parsed = JSON.parse(window.localStorage.getItem(EMOJI_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) {
      return DEFAULT_FREQUENT_EMOJIS;
    }
    return Array.from(new Set([
      ...parsed.filter(
        (emoji): emoji is string =>
          typeof emoji === "string" && Boolean(emoji.trim()),
      ),
      ...DEFAULT_FREQUENT_EMOJIS,
    ])).slice(0, 18);
  } catch {
    return DEFAULT_FREQUENT_EMOJIS;
  }
}

function rememberEmoji(emoji: string, current: readonly string[]) {
  const next = [emoji, ...current.filter((candidate) => candidate !== emoji)].slice(0, 18);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(EMOJI_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Local storage is optional; selection should still succeed.
    }
  }
  return next;
}

export interface PlatformEmojiPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (emoji: string) => void | Promise<void>;
  trigger?: PlatformPopupProps["trigger"];
  className?: string;
  placement?: PlatformPopupProps["placement"];
  ariaLabel?: string;
  disabled?: boolean;
}

export function PlatformEmojiPicker({
  open,
  onOpenChange,
  onSelect,
  trigger,
  className = "",
  placement = "bottom-end",
  ariaLabel = "Add reaction",
  disabled = false,
}: PlatformEmojiPickerProps) {
  const [query, setQuery] = useState("");
  const [frequentEmojis, setFrequentEmojis] = useState<string[]>(() =>
    readStoredFrequentEmojis(),
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const normalizedQuery = query.trim().toLowerCase();
  const groups = useMemo(() => {
    const candidates = [
      {
        id: "frequent",
        label: "Frequently used",
        emojis: frequentEmojis,
      },
      ...PLATFORM_EMOJI_GROUPS,
    ];
    if (!normalizedQuery) {
      return candidates;
    }
    const compactQuery = normalizedQuery.replace(/\s+/g, "");
    return candidates
      .map((group) => ({
        ...group,
        emojis: group.emojis.filter((emoji) =>
          emojiMatchesQuery(emoji, compactQuery)
          || group.label.toLowerCase().includes(normalizedQuery),
        ),
      }))
      .filter((group) => group.emojis.length);
  }, [frequentEmojis, normalizedQuery]);

  async function selectEmoji(emoji: string) {
    setFrequentEmojis((current) => rememberEmoji(emoji, current));
    await onSelect(emoji);
    onOpenChange(false);
  }

  return (
    <PlatformPopup
      open={open}
      portal
      variant="minimal"
      placement={placement}
      portalOffset={6}
      animation="down-in"
      rootClassName={className}
      surfaceClassName="platform-emoji-picker"
      surfaceProps={{
        role: "dialog",
        "aria-label": "Emoji picker",
        width: 274,
      }}
      trigger={trigger || (({ open: isOpen }) => (
        <PlatformIconButton
          type="button"
          size="small"
          aria-label={ariaLabel}
          title={ariaLabel}
          aria-expanded={isOpen}
          disabled={disabled}
          onClick={() => onOpenChange(!isOpen)}
        >
          <SmilePlus width={15} height={15} strokeWidth={1.8} aria-hidden="true" />
        </PlatformIconButton>
      ))}
    >
      <PlatformPopupSearchHeader
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search emoji..."
        aria-label="Search emoji"
        autoFocus
      />
      <div className="platform-emoji-picker__scroll">
        {groups.length ? groups.map((group) => (
          <section className="platform-emoji-picker__group" key={group.id}>
            <h3 className="platform-emoji-picker__group-title">{group.label}</h3>
            <div className="platform-emoji-picker__grid">
              {group.emojis.map((emoji) => (
                <button
                  type="button"
                  className="platform-emoji-picker__emoji"
                  key={`${group.id}:${emoji}`}
                  aria-label={`React with ${emoji}`}
                  title={emoji}
                  onClick={() => void selectEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </section>
        )) : (
          <div className="platform-emoji-picker__empty">No emoji found.</div>
        )}
      </div>
    </PlatformPopup>
  );
}
