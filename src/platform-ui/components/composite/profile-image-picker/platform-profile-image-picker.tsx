import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Check } from "lucide-react";
import { PlatformPopup } from "../popup/index.js";

export interface PlatformProfileImageOption {
  id: string;
  label: string;
  url: string;
}

export const PLATFORM_PROFILE_IMAGE_PRESET_OPTIONS: readonly PlatformProfileImageOption[] =
  Object.freeze([
    { id: "spark", label: "Spark", url: "/img/agent-profile-pics/spark.webp" },
    { id: "forge", label: "Forge", url: "/img/agent-profile-pics/forge.webp" },
    { id: "foundry", label: "Foundry", url: "/img/agent-profile-pics/foundry.webp" },
    {
      id: "assistantastro",
      label: "Assistant Astro",
      url: "/img/agent-profile-pics/assistantastro-1.webp",
    },
    { id: "devastro", label: "Developer Astro", url: "/img/agent-profile-pics/devastro.webp" },
    {
      id: "researchastro",
      label: "Research Astro",
      url: "/img/agent-profile-pics/researchastro.webp",
    },
    { id: "blueastro", label: "Blue Astro", url: "/img/agent-profile-pics/blueastro.webp" },
    {
      id: "orangeastro",
      label: "Orange Astro",
      url: "/img/agent-profile-pics/orangeastro.webp",
    },
    { id: "suitastro", label: "Suit Astro", url: "/img/agent-profile-pics/suitastro.webp" },
  ]);

export interface PlatformProfileImagePickerProps {
  value?: string;
  hoverValue?: string;
  fallback?: ReactNode;
  options?: readonly PlatformProfileImageOption[];
  editable?: boolean;
  disabled?: boolean;
  busy?: boolean;
  size?: number;
  ariaLabel?: string;
  className?: string;
  onChange?: (url: string, option: PlatformProfileImageOption) => void;
  onOpenChange?: (open: boolean) => void;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string =>
      typeof className === "string" && Boolean(className.trim()))
    .map((className) => className.trim())
    .join(" ");
}

export function getPlatformProfileImageInitials(value: string, fallback = "?") {
  const parts = String(value || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  return parts.slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase();
}

export function PlatformProfileImagePicker({
  value = "",
  hoverValue = "",
  fallback = "?",
  options = PLATFORM_PROFILE_IMAGE_PRESET_OPTIONS,
  editable = true,
  disabled = false,
  busy = false,
  size = 48,
  ariaLabel = "Choose profile picture",
  className = "",
  onChange,
  onOpenChange,
}: PlatformProfileImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const normalizedValue = String(value || "").trim();
  const normalizedHoverValue = String(hoverValue || "").trim();
  const displayedValue = hovered && normalizedHoverValue
    ? normalizedHoverValue
    : normalizedValue;
  const canEdit = editable && !disabled && !busy && typeof onChange === "function";
  const style = { "--platform-profile-image-size": `${Math.max(24, size)}px` } as CSSProperties;
  const updateOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    setImageBroken(false);
  }, [displayedValue]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target) || surfaceRef.current?.contains(target)) return;
      updateOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") updateOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  const imageContent = displayedValue && !imageBroken ? (
    <img
      className="platform-profile-image-picker__image"
      src={displayedValue}
      alt=""
      decoding="async"
      draggable={false}
      onError={() => setImageBroken(true)}
    />
  ) : (
    <span className="platform-profile-image-picker__fallback">{fallback}</span>
  );

  if (!canEdit) {
    return (
      <div
        className={joinClassNames("platform-profile-image-picker", "is-readonly", className)}
        style={style}
        aria-label={ariaLabel}
        onMouseEnter={normalizedHoverValue ? () => setHovered(true) : undefined}
        onMouseLeave={normalizedHoverValue ? () => setHovered(false) : undefined}
      >
        <span className="platform-profile-image-picker__surface">{imageContent}</span>
      </div>
    );
  }

  return (
    <PlatformPopup
      open={open}
      rootRef={rootRef}
      surfaceRef={surfaceRef}
      rootClassName={joinClassNames("platform-profile-image-picker", open && "is-open", className)}
      rootProps={{
        style,
        onMouseEnter: normalizedHoverValue ? () => setHovered(true) : undefined,
        onMouseLeave: normalizedHoverValue ? () => setHovered(false) : undefined,
      }}
      portal
      placement="bottom-start"
      portalOffset={8}
      animation="down-in"
      surfaceClassName="platform-profile-image-picker__menu"
      surfaceProps={{
        role: "listbox",
        "aria-label": "Profile picture options",
        width: 230,
      }}
      trigger={
        <button
          type="button"
          className="platform-profile-image-picker__surface is-trigger"
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => updateOpen(!open)}
        >
          {imageContent}
        </button>
      }
    >
      <div className="platform-profile-image-picker__options">
        {options.map((option) => {
          const selected = normalizedValue === option.url;
          return (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={selected}
              className={joinClassNames(
                "platform-profile-image-picker__option",
                selected && "is-selected",
              )}
              title={option.label}
              onClick={() => {
                onChange?.(option.url, option);
                updateOpen(false);
              }}
            >
              <img src={option.url} alt="" draggable={false} />
              {selected ? (
                <span className="platform-profile-image-picker__selected" aria-hidden="true">
                  <Check width={12} height={12} strokeWidth={2.2} />
                </span>
              ) : null}
              <span className="sr-only">{option.label}</span>
            </button>
          );
        })}
      </div>
    </PlatformPopup>
  );
}
