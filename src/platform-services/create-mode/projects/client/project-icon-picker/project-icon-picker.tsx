import type { LucideIcon } from "lucide-react";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { PlatformDetailTabBar } from "../../../../../platform-ui/components/composite/detail-tab-bar/index.js";
import { PlatformPopup } from "../../../../../platform-ui/components/composite/popup/index.js";
import { PlatformSearch } from "../../../../../platform-ui/components/ui/search/index.js";

export interface ProjectIconPickerOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface ProjectIconPickerValue {
  icon: string;
  color: string;
}

export interface ProjectIconPickerProps {
  projectName: string;
  icon: string;
  color: string;
  iconOptions: readonly ProjectIconPickerOption[];
  colorOptions: readonly string[];
  showProjectName?: boolean;
  disabled?: boolean;
  onChange: (value: ProjectIconPickerValue) => boolean | undefined | Promise<boolean | undefined>;
  className?: string;
}

type ProjectIconPickerTab = "icons" | "emojis";

interface ProjectEmojiOption {
  id: string;
  label: string;
  glyph: string;
}

const PROJECT_EMOJI_OPTIONS: readonly ProjectEmojiOption[] = [
  { id: "emoji:\u{1F680}", label: "Rocket", glyph: "\u{1F680}" },
  { id: "emoji:\u{1F525}", label: "Fire", glyph: "\u{1F525}" },
  { id: "emoji:\u{1F4A1}", label: "Idea", glyph: "\u{1F4A1}" },
  { id: "emoji:\u{1F3AF}", label: "Target", glyph: "\u{1F3AF}" },
  { id: "emoji:\u{2728}", label: "Sparkles", glyph: "\u{2728}" },
  { id: "emoji:\u{1F4BB}", label: "Computer", glyph: "\u{1F4BB}" },
  { id: "emoji:\u{1F916}", label: "Robot", glyph: "\u{1F916}" },
  { id: "emoji:\u{1F9E0}", label: "Brain", glyph: "\u{1F9E0}" },
  { id: "emoji:\u{1F52C}", label: "Research", glyph: "\u{1F52C}" },
  { id: "emoji:\u{1F4CA}", label: "Chart", glyph: "\u{1F4CA}" },
  { id: "emoji:\u{1F4C8}", label: "Growth", glyph: "\u{1F4C8}" },
  { id: "emoji:\u{1F4B0}", label: "Revenue", glyph: "\u{1F4B0}" },
  { id: "emoji:\u{1F6E0}\u{FE0F}", label: "Tools", glyph: "\u{1F6E0}\u{FE0F}" },
  { id: "emoji:\u{2699}\u{FE0F}", label: "Settings", glyph: "\u{2699}\u{FE0F}" },
  { id: "emoji:\u{1F3D7}\u{FE0F}", label: "Build", glyph: "\u{1F3D7}\u{FE0F}" },
  { id: "emoji:\u{1F4E6}", label: "Package", glyph: "\u{1F4E6}" },
  { id: "emoji:\u{1F4C1}", label: "Files", glyph: "\u{1F4C1}" },
  { id: "emoji:\u{1F5C2}\u{FE0F}", label: "Archive", glyph: "\u{1F5C2}\u{FE0F}" },
  { id: "emoji:\u{1F4DD}", label: "Writing", glyph: "\u{1F4DD}" },
  { id: "emoji:\u{1F4AC}", label: "Conversation", glyph: "\u{1F4AC}" },
  { id: "emoji:\u{1F465}", label: "Team", glyph: "\u{1F465}" },
  { id: "emoji:\u{1F91D}", label: "Partnership", glyph: "\u{1F91D}" },
  { id: "emoji:\u{1F3E2}", label: "Company", glyph: "\u{1F3E2}" },
  { id: "emoji:\u{1F30D}", label: "Global", glyph: "\u{1F30D}" },
  { id: "emoji:\u{1F4CD}", label: "Location", glyph: "\u{1F4CD}" },
  { id: "emoji:\u{1F512}", label: "Security", glyph: "\u{1F512}" },
  { id: "emoji:\u{1F511}", label: "Access", glyph: "\u{1F511}" },
  { id: "emoji:\u{1F6E1}\u{FE0F}", label: "Protection", glyph: "\u{1F6E1}\u{FE0F}" },
  { id: "emoji:\u{26A1}", label: "Fast", glyph: "\u{26A1}" },
  { id: "emoji:\u{2705}", label: "Complete", glyph: "\u{2705}" },
  { id: "emoji:\u{1F4CC}", label: "Pinned", glyph: "\u{1F4CC}" },
  { id: "emoji:\u{1F5D3}\u{FE0F}", label: "Calendar", glyph: "\u{1F5D3}\u{FE0F}" },
  { id: "emoji:\u{1F3A8}", label: "Design", glyph: "\u{1F3A8}" },
  { id: "emoji:\u{1F3AC}", label: "Media", glyph: "\u{1F3AC}" },
  { id: "emoji:\u{1F3B5}", label: "Audio", glyph: "\u{1F3B5}" },
  { id: "emoji:\u{1F9EA}", label: "Experiment", glyph: "\u{1F9EA}" },
  { id: "emoji:\u{1F9EC}", label: "Science", glyph: "\u{1F9EC}" },
  { id: "emoji:\u{1F4DA}", label: "Knowledge", glyph: "\u{1F4DA}" },
  { id: "emoji:\u{2764}\u{FE0F}", label: "Heart", glyph: "\u{2764}\u{FE0F}" },
  { id: "emoji:\u{2B50}", label: "Star", glyph: "\u{2B50}" },
  { id: "emoji:\u{1F4CB}", label: "Clipboard", glyph: "\u{1F4CB}" },
  { id: "emoji:\u{1F9ED}", label: "Compass", glyph: "\u{1F9ED}" },
  { id: "emoji:\u{1F50E}", label: "Search", glyph: "\u{1F50E}" },
  { id: "emoji:\u{1F4E3}", label: "Announcement", glyph: "\u{1F4E3}" },
  { id: "emoji:\u{1F4E7}", label: "Email", glyph: "\u{1F4E7}" },
  { id: "emoji:\u{1F4F1}", label: "Mobile", glyph: "\u{1F4F1}" },
  { id: "emoji:\u{1F6D2}", label: "Commerce", glyph: "\u{1F6D2}" },
  { id: "emoji:\u{1F3F7}\u{FE0F}", label: "Label", glyph: "\u{1F3F7}\u{FE0F}" },
  { id: "emoji:\u{1F9FE}", label: "Receipt", glyph: "\u{1F9FE}" },
  { id: "emoji:\u{1F4B3}", label: "Payments", glyph: "\u{1F4B3}" },
  { id: "emoji:\u{1F3E6}", label: "Banking", glyph: "\u{1F3E6}" },
  { id: "emoji:\u{2696}\u{FE0F}", label: "Legal", glyph: "\u{2696}\u{FE0F}" },
  { id: "emoji:\u{1FA7A}", label: "Health", glyph: "\u{1FA7A}" },
  { id: "emoji:\u{1F331}", label: "Sustainability", glyph: "\u{1F331}" },
  { id: "emoji:\u{1F310}", label: "Web", glyph: "\u{1F310}" },
  { id: "emoji:\u{1F578}\u{FE0F}", label: "Network", glyph: "\u{1F578}\u{FE0F}" },
  { id: "emoji:\u{1F6F0}\u{FE0F}", label: "Satellite", glyph: "\u{1F6F0}\u{FE0F}" },
  { id: "emoji:\u{2708}\u{FE0F}", label: "Travel", glyph: "\u{2708}\u{FE0F}" },
  { id: "emoji:\u{1F69A}", label: "Logistics", glyph: "\u{1F69A}" },
  { id: "emoji:\u{1F3ED}", label: "Manufacturing", glyph: "\u{1F3ED}" },
  { id: "emoji:\u{1F3E0}", label: "Home", glyph: "\u{1F3E0}" },
  { id: "emoji:\u{1F393}", label: "Education", glyph: "\u{1F393}" },
  { id: "emoji:\u{1F3C6}", label: "Achievement", glyph: "\u{1F3C6}" },
  { id: "emoji:\u{1F381}", label: "Reward", glyph: "\u{1F381}" },
  { id: "emoji:\u{1F4CE}", label: "Attachment", glyph: "\u{1F4CE}" },
  { id: "emoji:\u{1F517}", label: "Link", glyph: "\u{1F517}" },
  { id: "emoji:\u{1F9E9}", label: "Integration", glyph: "\u{1F9E9}" },
  { id: "emoji:\u{265F}\u{FE0F}", label: "Strategy", glyph: "\u{265F}\u{FE0F}" },
  { id: "emoji:\u{23F1}\u{FE0F}", label: "Time", glyph: "\u{23F1}\u{FE0F}" },
  { id: "emoji:\u{1F514}", label: "Alerts", glyph: "\u{1F514}" },
  { id: "emoji:\u{1F5FA}\u{FE0F}", label: "Map", glyph: "\u{1F5FA}\u{FE0F}" },
  { id: "emoji:\u{1F9F1}", label: "Foundation", glyph: "\u{1F9F1}" },
  { id: "emoji:\u{1FA84}", label: "Magic", glyph: "\u{1FA84}" },
  { id: "emoji:\u{1F5F9}\u{FE0F}", label: "Checklist", glyph: "\u{1F5F9}\u{FE0F}" },
  { id: "emoji:\u{1F4BE}", label: "Data", glyph: "\u{1F4BE}" },
  { id: "emoji:\u{1F48E}", label: "Quality", glyph: "\u{1F48E}" },
  { id: "emoji:\u{1F3A5}", label: "Video", glyph: "\u{1F3A5}" },
  { id: "emoji:\u{1F3A7}", label: "Support", glyph: "\u{1F3A7}" },
  { id: "emoji:\u{1F6CD}\u{FE0F}", label: "Shopping", glyph: "\u{1F6CD}\u{FE0F}" },
  { id: "emoji:\u{1F5C3}\u{FE0F}", label: "Records", glyph: "\u{1F5C3}\u{FE0F}" },
];

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

function getProjectEmoji(icon: string) {
  const normalizedIcon = String(icon || "").trim();
  return normalizedIcon.startsWith("emoji:") ? normalizedIcon.slice("emoji:".length).trim() : "";
}

function normalizeProjectColor(value: string, fallback: string) {
  const normalizedValue = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(normalizedValue) ? normalizedValue : fallback;
}

function ProjectIdentityGlyph({
  icon,
  iconOptions,
  size,
}: {
  icon: string;
  iconOptions: readonly ProjectIconPickerOption[];
  size: number;
}) {
  const emoji = getProjectEmoji(icon);
  if (emoji) {
    return (
      <span
        className="platform-project-icon-picker__emoji"
        style={{ fontSize: Math.max(12, size - 2) }}
        aria-hidden="true"
      >
        {emoji}
      </span>
    );
  }
  const selectedOption = iconOptions.find((option) => option.id === icon) || iconOptions[0];
  const Icon = selectedOption?.icon;
  return Icon ? <Icon width={size} height={size} strokeWidth={1.8} aria-hidden="true" /> : null;
}

export function ProjectIconPicker({
  projectName,
  icon,
  color,
  iconOptions,
  colorOptions,
  showProjectName = true,
  disabled = false,
  onChange,
  className = "",
}: ProjectIconPickerProps) {
  const fallbackIcon = iconOptions[0]?.id || "rocket";
  const fallbackColor = colorOptions[0] || "#79d0ff";
  const normalizedValue = useMemo<ProjectIconPickerValue>(
    () => ({
      icon: String(icon || "").trim() || fallbackIcon,
      color: normalizeProjectColor(color, fallbackColor),
    }),
    [color, fallbackColor, fallbackIcon, icon],
  );
  const [draftValue, setDraftValue] = useState<ProjectIconPickerValue>(normalizedValue);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProjectIconPickerTab>("icons");
  const [searchQuery, setSearchQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const colorInputRef = useRef<HTMLInputElement | null>(null);
  const latestValueRef = useRef(normalizedValue);
  const onChangeRef = useRef(onChange);
  const pendingValueRef = useRef<ProjectIconPickerValue | null>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    latestValueRef.current = normalizedValue;
    if (!savingRef.current && !pendingValueRef.current) {
      setDraftValue(normalizedValue);
    }
  }, [normalizedValue]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && (rootRef.current?.contains(target) || surfaceRef.current?.contains(target))) {
        return;
      }
      setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [open]);

  const flushPendingChanges = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    try {
      while (pendingValueRef.current) {
        const nextValue = pendingValueRef.current;
        pendingValueRef.current = null;
        const saved = await onChangeRef.current(nextValue);
        if (saved === false && !pendingValueRef.current) {
          setDraftValue(latestValueRef.current);
        }
      }
    } finally {
      savingRef.current = false;
    }
  };

  const updateValue = (updates: Partial<ProjectIconPickerValue>) => {
    const nextValue = {
      ...draftValue,
      ...updates,
    };
    setDraftValue(nextValue);
    pendingValueRef.current = nextValue;
    void flushPendingChanges();
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredIconOptions = iconOptions.filter((option) => {
    if (!normalizedQuery) return true;
    return (
      option.label.toLowerCase().includes(normalizedQuery) ||
      option.id.toLowerCase().includes(normalizedQuery)
    );
  });
  const filteredEmojiOptions = PROJECT_EMOJI_OPTIONS.filter((option) => {
    if (!normalizedQuery) return true;
    return option.label.toLowerCase().includes(normalizedQuery);
  });
  const triggerStyle = {
    "--project-icon-color": draftValue.color,
  } as CSSProperties;

  return (
    <PlatformPopup
      open={open}
      rootRef={rootRef}
      surfaceRef={surfaceRef}
      rootClassName={joinClassNames("platform-project-icon-picker", className)}
      surfaceClassName="platform-project-icon-picker__popup"
      variant="minimal"
      animation="down-in"
      portal
      placement="bottom-start"
      portalOffset={8}
      surfaceProps={{
        width: 420,
        maxWidth: "calc(100vw - 24px)",
        maxHeight: "min(560px, calc(100vh - 24px))",
      }}
      trigger={({ open: triggerOpen }) => (
        <>
          <button
            type="button"
            className={joinClassNames(
              "platform-project-icon-picker__trigger",
              triggerOpen && "is-open",
            )}
            style={triggerStyle}
            aria-label={
              disabled ? `${projectName} project icon` : `Change icon and color for ${projectName}`
            }
            aria-expanded={triggerOpen}
            disabled={disabled}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              if (!disabled) setOpen((current) => !current);
            }}
          >
            <span className="platform-project-icon-picker__trigger-icon">
              <ProjectIdentityGlyph icon={draftValue.icon} iconOptions={iconOptions} size={18} />
            </span>
          </button>
          {showProjectName ? (
            <span className="platform-project-icon-picker__project-name">{projectName}</span>
          ) : null}
        </>
      )}
    >
      <PlatformDetailTabBar<ProjectIconPickerTab>
        tabs={[
          { id: "icons", label: "Icons" },
          { id: "emojis", label: "Emojis" },
        ]}
        value={activeTab}
        onValueChange={(nextTab) => {
          setActiveTab(nextTab);
          setSearchQuery("");
        }}
        variant="minimal"
        ariaLabel="Project icon type"
        className="platform-project-icon-picker__tabs"
      />
      <fieldset className="platform-project-icon-picker__colors" aria-label="Project icon color">
        {colorOptions.map((colorOption) => (
          <button
            key={colorOption}
            type="button"
            className={joinClassNames(
              "platform-project-icon-picker__color",
              draftValue.color.toLowerCase() === colorOption.toLowerCase() && "is-selected",
            )}
            style={{ backgroundColor: colorOption }}
            aria-label={`Use ${colorOption}`}
            aria-pressed={draftValue.color.toLowerCase() === colorOption.toLowerCase()}
            onClick={() => updateValue({ color: colorOption })}
          />
        ))}
        <span className="platform-project-icon-picker__color-divider" aria-hidden="true" />
        <button
          type="button"
          className="platform-project-icon-picker__custom-color"
          aria-label="Choose a custom color"
          onClick={() => colorInputRef.current?.click()}
        />
        <input
          ref={colorInputRef}
          type="color"
          className="platform-project-icon-picker__color-input"
          value={draftValue.color}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => updateValue({ color: event.target.value })}
        />
      </fieldset>
      <div className="platform-project-icon-picker__search">
        <PlatformSearch
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={activeTab === "icons" ? "Search icons" : "Search emojis"}
          autoFocus
        />
      </div>
      <div
        className="platform-project-icon-picker__grid"
        role="group"
        aria-label={activeTab === "icons" ? "Project icons" : "Project emojis"}
        onWheelCapture={(event) => {
          if (event.currentTarget.scrollHeight > event.currentTarget.clientHeight) {
            event.stopPropagation();
          }
        }}
      >
        {activeTab === "icons"
          ? filteredIconOptions.map((option) => {
              const OptionIcon = option.icon;
              const selected = draftValue.icon === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={joinClassNames(
                    "platform-project-icon-picker__option",
                    selected && "is-selected",
                  )}
                  aria-label={option.label}
                  aria-pressed={selected}
                  title={option.label}
                  onClick={() => updateValue({ icon: option.id })}
                >
                  <OptionIcon width={17} height={17} strokeWidth={1.8} aria-hidden="true" />
                </button>
              );
            })
          : filteredEmojiOptions.map((option) => {
              const selected = draftValue.icon === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={joinClassNames(
                    "platform-project-icon-picker__option",
                    "is-emoji",
                    selected && "is-selected",
                  )}
                  aria-label={option.label}
                  aria-pressed={selected}
                  title={option.label}
                  onClick={() => updateValue({ icon: option.id })}
                >
                  {option.glyph}
                </button>
              );
            })}
        {(activeTab === "icons" ? filteredIconOptions : filteredEmojiOptions).length === 0 ? (
          <div className="platform-project-icon-picker__empty">No matching {activeTab}</div>
        ) : null}
      </div>
    </PlatformPopup>
  );
}
