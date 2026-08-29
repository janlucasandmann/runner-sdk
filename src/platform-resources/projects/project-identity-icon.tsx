import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  Bell,
  BookOpen,
  Bot,
  Brain,
  Braces,
  Building2,
  Cable,
  Calculator,
  CalendarIcon,
  Camera,
  ChartColumnIncreasing,
  CircleCheckBig,
  Clock,
  Cloud,
  Code2,
  Coins,
  Cpu,
  Database,
  DollarSign,
  FileText,
  FingerprintPattern,
  Flame,
  FlaskConical,
  FolderOpen,
  FunctionSquare,
  GitBranch,
  Globe,
  Hand,
  HardDrive,
  Heart,
  House,
  ImageIcon,
  KeyRound,
  Layers,
  LayoutGrid,
  LibraryBig,
  Lightbulb,
  Link2,
  ListTodo,
  Mail,
  MapPin,
  MessageCircle,
  Metronome,
  Mic,
  Milestone,
  Monitor,
  Package,
  Paintbrush,
  Paperclip,
  PencilRuler,
  PenTool,
  Pin,
  ReceiptText,
  Rocket,
  Scan,
  Server,
  Shield,
  SlidersHorizontal,
  Sparkles,
  StickyNote,
  Tag,
  Telescope,
  Terminal,
  TestTubeDiagonal,
  UserRound,
  UsersRound,
  Vault,
  Wand2,
  Webhook,
  Zap,
} from "lucide-react";

export interface PlatformProjectIconOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const PLATFORM_PROJECT_ICON_OPTIONS = [
  { id: "rocket", label: "Rocket", icon: Rocket },
  { id: "flame", label: "Flame", icon: Flame },
  { id: "layout-grid", label: "Grid", icon: LayoutGrid },
  { id: "layers", label: "Layers", icon: Layers },
  { id: "code", label: "Code", icon: Code2 },
  { id: "sparkles", label: "Sparkles", icon: Sparkles },
  { id: "calculator", label: "Analysis", icon: Calculator },
  { id: "users", label: "Customers", icon: UsersRound },
  { id: "telescope", label: "Discovery", icon: Telescope },
  { id: "bot", label: "Bot", icon: Bot },
  { id: "message-circle", label: "Threads", icon: MessageCircle },
  { id: "folder-open", label: "Workspace", icon: FolderOpen },
  { id: "hard-drive", label: "Environment", icon: HardDrive },
  { id: "zap", label: "Execution", icon: Zap },
  { id: "award", label: "Award", icon: Award },
  { id: "book-open", label: "Knowledge", icon: BookOpen },
  { id: "brain", label: "Intelligence", icon: Brain },
  { id: "building", label: "Organization", icon: Building2 },
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "camera", label: "Camera", icon: Camera },
  { id: "cloud", label: "Cloud", icon: Cloud },
  { id: "cpu", label: "Compute", icon: Cpu },
  { id: "database", label: "Database", icon: Database },
  { id: "flag", label: "Milestone", icon: Milestone },
  { id: "globe", label: "Global", icon: Globe },
  { id: "hand", label: "Human", icon: Hand },
  { id: "heart", label: "Favorite", icon: Heart },
  { id: "house", label: "Home", icon: House },
  { id: "key", label: "Access", icon: KeyRound },
  { id: "library", label: "Library", icon: LibraryBig },
  { id: "lightbulb", label: "Idea", icon: Lightbulb },
  { id: "mail", label: "Mail", icon: Mail },
  { id: "map-pin", label: "Location", icon: MapPin },
  { id: "monitor", label: "Desktop", icon: Monitor },
  { id: "package", label: "Package", icon: Package },
  { id: "paintbrush", label: "Design", icon: Paintbrush },
  { id: "pen-tool", label: "Writing", icon: PenTool },
  { id: "receipt", label: "Finance", icon: ReceiptText },
  { id: "server", label: "Server", icon: Server },
  { id: "shield", label: "Security", icon: Shield },
  { id: "tag", label: "Tag", icon: Tag },
  { id: "terminal", label: "Terminal", icon: Terminal },
  { id: "test-tube", label: "Experiment", icon: TestTubeDiagonal },
  { id: "vault", label: "Vault", icon: Vault },
  { id: "wand", label: "Magic", icon: Wand2 },
  { id: "webhook", label: "Webhook", icon: Webhook },
  { id: "bell", label: "Alerts", icon: Bell },
  { id: "braces", label: "Data", icon: Braces },
  { id: "cable", label: "Connections", icon: Cable },
  { id: "chart-column", label: "Analytics", icon: ChartColumnIncreasing },
  { id: "circle-check", label: "Success", icon: CircleCheckBig },
  { id: "clock", label: "Time", icon: Clock },
  { id: "coins", label: "Budget", icon: Coins },
  { id: "dollar-sign", label: "Revenue", icon: DollarSign },
  { id: "file-text", label: "Documents", icon: FileText },
  { id: "fingerprint", label: "Identity", icon: FingerprintPattern },
  { id: "flask", label: "Lab", icon: FlaskConical },
  { id: "function", label: "Function", icon: FunctionSquare },
  { id: "git-branch", label: "Versions", icon: GitBranch },
  { id: "image", label: "Images", icon: ImageIcon },
  { id: "link", label: "Integration", icon: Link2 },
  { id: "list-todo", label: "Tasks", icon: ListTodo },
  { id: "metronome", label: "Workflow", icon: Metronome },
  { id: "mic", label: "Voice", icon: Mic },
  { id: "paperclip", label: "Attachments", icon: Paperclip },
  { id: "pencil-ruler", label: "Planning", icon: PencilRuler },
  { id: "pin", label: "Pinned", icon: Pin },
  { id: "scan", label: "Vision", icon: Scan },
  { id: "sliders", label: "Controls", icon: SlidersHorizontal },
  { id: "sticky-note", label: "Notes", icon: StickyNote },
  { id: "user", label: "Person", icon: UserRound },
] as const satisfies readonly PlatformProjectIconOption[];

export interface PlatformProjectIdentityIconProps {
  icon?: string;
  iconOptions?: readonly PlatformProjectIconOption[];
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

export function normalizePlatformProjectIconId(
  value: unknown,
  iconOptions: readonly PlatformProjectIconOption[] = PLATFORM_PROJECT_ICON_OPTIONS,
) {
  const normalized = String(value || "").trim();
  if (normalized.startsWith("emoji:") && normalized.slice("emoji:".length).trim()) {
    return normalized;
  }
  return iconOptions.some((option) => option.id === normalized)
    ? normalized
    : (iconOptions[0]?.id || "rocket");
}

export function PlatformProjectIdentityIcon({
  icon = "rocket",
  iconOptions = PLATFORM_PROJECT_ICON_OPTIONS,
  size = 16,
  strokeWidth = 1.8,
  className,
  style,
  title,
}: PlatformProjectIdentityIconProps) {
  const normalizedIcon = normalizePlatformProjectIconId(icon, iconOptions);
  const emoji = normalizedIcon.startsWith("emoji:")
    ? normalizedIcon.slice("emoji:".length).trim()
    : "";
  if (emoji) {
    return (
      <span
        className={className}
        style={{
          ...style,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          fontSize: Math.max(12, size - 2),
          lineHeight: 1,
        }}
        role={title ? "img" : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : "true"}
        data-platform-project-icon={normalizedIcon}
      >
        {emoji}
      </span>
    );
  }

  const option = iconOptions.find((candidate) => candidate.id === normalizedIcon)
    || iconOptions[0];
  const Icon = option?.icon || Rocket;
  return (
    <Icon
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      aria-label={title}
      aria-hidden={title ? undefined : "true"}
      data-platform-project-icon={normalizedIcon}
    />
  );
}
