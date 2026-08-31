import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar04Icon,
  Chat01Icon,
  Chatting01Icon,
  CorporateIcon,
  Folder02Icon,
  LibraryIcon,
  Mic02Icon,
  PencilEdit02Icon,
  PlusIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";

interface RunnerChatIconProps {
  className?: string;
  strokeWidth?: number;
}

export function IconFolderPlus({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M12 10v6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconVideo({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M14 2v4a2 2 0 0 0 2 2h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.033 13.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56v-4.704a.645.645 0 0 1 .967-.56z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMusic({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M9 18V5l12-2v13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="16" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCloud({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

export function IconImages({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <rect x="3" y="5" width="14" height="14" rx="2" strokeWidth="1.5" />
      <path d="m3 15 4-4 3 3 3-3 4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="1.25" fill="currentColor" stroke="none" />
      <path d="M17 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconFileText({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSearch({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function IconX({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronLeft({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m15 6-6 6 6 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronDown({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m6 9 6 6 6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronUp({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m6 15 6-6 6 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronRight({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m9 6 6 6-6 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPlus({ className, strokeWidth = 1.75 }: RunnerChatIconProps) {
  return (
    <HugeiconsIcon
      icon={PlusIcon}
      className={className}
      size="1em"
      color="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
}

export function IconStar({ className, strokeWidth = 1.75 }: RunnerChatIconProps) {
  return (
    <HugeiconsIcon
      icon={StarIcon}
      className={className}
      size="1em"
      color="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
}

export function IconCorporate({ className, strokeWidth = 1.75 }: RunnerChatIconProps) {
  return (
    <HugeiconsIcon
      icon={CorporateIcon}
      className={className}
      size="1em"
      color="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
}

export function IconSidebarFiles({ className, strokeWidth = 1.75 }: RunnerChatIconProps) {
  return (
    <HugeiconsIcon
      icon={Folder02Icon}
      className={className}
      size="1em"
      color="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
}

export function IconSidebarPrompts({ className, strokeWidth = 1.75 }: RunnerChatIconProps) {
  return (
    <HugeiconsIcon
      icon={Chat01Icon}
      className={className}
      size="1em"
      color="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
}

export function IconSidebarKnowledge({ className, strokeWidth = 1.75 }: RunnerChatIconProps) {
  return (
    <HugeiconsIcon
      icon={LibraryIcon}
      className={className}
      size="1em"
      color="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
}

export function IconSidebarNewThread({ className, strokeWidth = 1.75 }: RunnerChatIconProps) {
  return (
    <HugeiconsIcon
      icon={PencilEdit02Icon}
      className={className}
      size="1em"
      color="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
}

export function IconSidebarThreads({ className, strokeWidth = 1.75 }: RunnerChatIconProps) {
  return (
    <HugeiconsIcon
      icon={Chatting01Icon}
      className={className}
      size="1em"
      color="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
}

export function IconSidebarCalendar({ className, strokeWidth = 1.75 }: RunnerChatIconProps) {
  return (
    <HugeiconsIcon
      icon={Calendar04Icon}
      className={className}
      size="1em"
      color="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
}

export function IconPaperclip({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m21.44 11.05-8.49 8.49a5.5 5.5 0 0 1-7.78-7.78l8.49-8.48a3.5 3.5 0 1 1 4.95 4.95l-8.49 8.49a1.5 1.5 0 0 1-2.12-2.12l7.78-7.78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLayers({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m12 3 9 4.5-9 4.5-9-4.5 9-4.5ZM3 12l9 4.5 9-4.5M3 16.5 12 21l9-4.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconUser({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M18 20a6 6 0 0 0-12 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconGithub({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export function IconGitlab({ className }: RunnerChatIconProps) {
  return (
    <img
      className={className}
      src="/img/04-skills/gitlab.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}

export function IconGoogleDrive({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 87.3 78" aria-hidden="true">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
    </svg>
  );
}

export function IconOneDrive({ className }: RunnerChatIconProps) {
  return (
    <img
      className={className}
      src="https://upload.wikimedia.org/wikipedia/commons/5/59/Microsoft_Office_OneDrive_%282019%E2%80%932025%29.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}

export function IconNotion({ className }: RunnerChatIconProps) {
  return (
    <img
      className={className}
      src="https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}

export function IconAtlassian({ className }: RunnerChatIconProps) {
  return (
    <img
      className={className}
      src="/img/plugins/atlassian.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}

export function IconClock({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="8" strokeWidth="1.5" />
      <path d="M12 8v5l3 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconFolderOpen({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H9l2 2h7.5A2.5 2.5 0 0 1 21 10.5v6A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-8Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconFile({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLoader2({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLogout({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMic({ className, strokeWidth = 1.75 }: RunnerChatIconProps) {
  return (
    <HugeiconsIcon
      icon={Mic02Icon}
      className={className}
      size="1em"
      color="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
}

export function IconStop({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="7.5" y="7.5" width="9" height="9" rx="1.75" />
    </svg>
  );
}

export function IconCheck({ className }: RunnerChatIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m5 12 5 5L20 7" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
