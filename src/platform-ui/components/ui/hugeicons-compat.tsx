import * as Hugeicons from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type HugeiconsIconProps, type IconSvgElement } from "@hugeicons/react";
import type { ComponentType, SVGProps } from "react";

type HugeiconsCompatProps = Omit<SVGProps<SVGSVGElement>, "strokeWidth"> & {
  strokeWidth?: number | string;
  size?: number | string;
  absoluteStrokeWidth?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  disableSecondaryOpacity?: boolean;
};
// Keep the compatibility type intentionally permissive. Existing shared components
// accept both number-only and string-capable SVG dimensions for icon slots.
export type LucideIcon = ComponentType<any>;

const iconDefinitions = Hugeicons as unknown as Record<string, IconSvgElement | undefined>;

function toKebabCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/([A-Za-z])([0-9])/g, "$1-$2")
    .replace(/([0-9])([A-Za-z])/g, "$1-$2")
    .toLowerCase();
}

function createHugeiconsCompatIcon(name: string, iconName = name): LucideIcon {
  return function HugeiconsCompatIcon(props: HugeiconsCompatProps) {
    const icon = iconDefinitions[iconName] ?? iconDefinitions.Circle;
    const className = [
      "hugeicons",
      `hugeicons-${toKebabCase(name)}`,
      props.className,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <HugeiconsIcon
        icon={icon!}
        strokeWidth={1.8}
        {...(props as unknown as Omit<HugeiconsIconProps, "icon">)}
        className={className}
        data-hugeicons-icon={name}
      />
    );
  };
}

export const Activity = createHugeiconsCompatIcon("Activity");
export const ArrowDown = createHugeiconsCompatIcon("ArrowDown");
export const ArrowUpRight = createHugeiconsCompatIcon("ArrowUpRight");
export const AudioLines = createHugeiconsCompatIcon("AudioLines", "AudioLinesIcon");
export const Battery = createHugeiconsCompatIcon("Battery");
export const BatteryFull = createHugeiconsCompatIcon("BatteryFull");
export const BatteryLow = createHugeiconsCompatIcon("BatteryLow");
export const BatteryMedium = createHugeiconsCompatIcon("BatteryMedium");
export const AlertCircle = createHugeiconsCompatIcon("AlertCircle");
export const AlertTriangle = createHugeiconsCompatIcon("AlertTriangle");
export const AlignCenter = createHugeiconsCompatIcon("AlignCenter");
export const AlignJustify = createHugeiconsCompatIcon("AlignJustify");
export const AlignLeft = createHugeiconsCompatIcon("AlignLeft");
export const AlignRight = createHugeiconsCompatIcon("AlignRight");
export const ArrowDownToLine = createHugeiconsCompatIcon("ArrowDownToLine", "ArrowDownToLineIcon");
export const ArrowLeft = createHugeiconsCompatIcon("ArrowLeft");
export const ArrowRight = createHugeiconsCompatIcon("ArrowRight");
export const ArrowUp = createHugeiconsCompatIcon("ArrowUp");
export const ArrowUpDown = createHugeiconsCompatIcon("ArrowUpDown");
export const ArrowUpFromLine = createHugeiconsCompatIcon("ArrowUpFromLine", "ArrowUpFromLineIcon");
export const Award = createHugeiconsCompatIcon("Award");
export const BadgeCheck = createHugeiconsCompatIcon("BadgeCheck");
export const Ban = createHugeiconsCompatIcon("Ban", "BanIcon");
export const Bell = createHugeiconsCompatIcon("Bell");
export const BetweenHorizontalEnd = createHugeiconsCompatIcon("BetweenHorizontalEnd", "BetweenHorizontalEndIcon");
export const BetweenHorizontalStart = createHugeiconsCompatIcon("BetweenHorizontalStart", "BetweenHorizontalStartIcon");
export const BetweenVerticalEnd = createHugeiconsCompatIcon("BetweenVerticalEnd", "BetweenVerticalEndIcon");
export const BetweenVerticalStart = createHugeiconsCompatIcon("BetweenVerticalStart", "BetweenVerticalStartIcon");
export const Bold = createHugeiconsCompatIcon("Bold");
export const BookOpen = createHugeiconsCompatIcon("BookOpen");
export const Bookmark = createHugeiconsCompatIcon("Bookmark");
export const Bot = createHugeiconsCompatIcon("Bot");
export const Braces = createHugeiconsCompatIcon("Braces");
export const Brain = createHugeiconsCompatIcon("Brain");
export const Building2 = createHugeiconsCompatIcon("Building2");
export const Cable = createHugeiconsCompatIcon("Cable");
export const Calculator = createHugeiconsCompatIcon("Calculator");
export const Calendar = createHugeiconsCompatIcon("Calendar");
export const CalendarIcon = createHugeiconsCompatIcon("CalendarIcon");
export const Camera = createHugeiconsCompatIcon("Camera");
export const ChartColumnIncreasing = createHugeiconsCompatIcon("ChartColumnIncreasing");
export const ChartNoAxesColumnIncreasing = createHugeiconsCompatIcon("ChartNoAxesColumnIncreasing", "ChartColumnIncreasing");
export const Check = createHugeiconsCompatIcon("Check");
export const CheckCircle2 = createHugeiconsCompatIcon("CheckCircle2", "CheckmarkCircle02Icon");
export const ChevronDown = createHugeiconsCompatIcon("ChevronDown");
export const ChevronLeft = createHugeiconsCompatIcon("ChevronLeft");
export const ChevronRight = createHugeiconsCompatIcon("ChevronRight");
export const ChevronUp = createHugeiconsCompatIcon("ChevronUp");
export const ChevronsUp = createHugeiconsCompatIcon("ChevronsUp");
export const ChevronsUpDown = createHugeiconsCompatIcon("ChevronsUpDown");
export const Circle = createHugeiconsCompatIcon("Circle");
export const CircleAlert = createHugeiconsCompatIcon("CircleAlert");
export const CircleCheck = createHugeiconsCompatIcon("CircleCheck");
export const CircleDashed = createHugeiconsCompatIcon("CircleDashed");
export const CircleHelp = createHugeiconsCompatIcon("CircleHelp", "CircleQuestionMarkIcon");
export const CircleMinus = createHugeiconsCompatIcon("CircleMinus");
export const CircleCheckBig = createHugeiconsCompatIcon("CircleCheckBig", "CheckmarkCircle02Icon");
export const CircleDot = createHugeiconsCompatIcon("CircleDot");
export const CircleEllipsis = createHugeiconsCompatIcon("CircleEllipsis", "CircleEllipsisIcon");
export const CirclePause = createHugeiconsCompatIcon("CirclePause");
export const CircleQuestionMark = createHugeiconsCompatIcon("CircleQuestionMark", "CircleQuestionMarkIcon");
export const CircleStop = createHugeiconsCompatIcon("CircleStop");
export const Clapperboard = createHugeiconsCompatIcon("Clapperboard");
export const ClipboardCheck = createHugeiconsCompatIcon("ClipboardCheck");
export const ClipboardList = createHugeiconsCompatIcon("ClipboardList");
export const ClipboardCopy = createHugeiconsCompatIcon("ClipboardCopy");
export const Clock = createHugeiconsCompatIcon("Clock");
export const Clock3 = createHugeiconsCompatIcon("Clock3");
export const Cloud = createHugeiconsCompatIcon("Cloud");
export const CloudCog = createHugeiconsCompatIcon("CloudCog");
export const Code = createHugeiconsCompatIcon("Code");
export const CornerDownRight = createHugeiconsCompatIcon("CornerDownRight", "CornerDownRightIcon");
export const Code2 = createHugeiconsCompatIcon("Code2", "CodeIcon");
export const CodeXml = createHugeiconsCompatIcon("CodeXml");
export const Coins = createHugeiconsCompatIcon("Coins");
export const Columns3 = createHugeiconsCompatIcon("Columns3");
export const Copy = createHugeiconsCompatIcon("Copy");
export const Cpu = createHugeiconsCompatIcon("Cpu");
export const CreditCard = createHugeiconsCompatIcon("CreditCard");
export const Crop = createHugeiconsCompatIcon("Crop");
export const Crown = createHugeiconsCompatIcon("Crown");
export const Database = createHugeiconsCompatIcon("Database");
export const Download = createHugeiconsCompatIcon("Download");
export const DollarSign = createHugeiconsCompatIcon("DollarSign");
export const Ellipsis = createHugeiconsCompatIcon("Ellipsis");
export const EllipsisVertical = createHugeiconsCompatIcon("EllipsisVertical");
export const Eraser = createHugeiconsCompatIcon("Eraser", "EraserIcon");
export const Equal = createHugeiconsCompatIcon("Equal", "EqualIcon");
export const Expand = createHugeiconsCompatIcon("Expand");
export const ExternalLink = createHugeiconsCompatIcon("ExternalLink");
export const Eye = createHugeiconsCompatIcon("Eye");
export const EyeOff = createHugeiconsCompatIcon("EyeOff");
export const File = createHugeiconsCompatIcon("File");
export const FileArchive = createHugeiconsCompatIcon("FileArchive");
export const FileDiff = createHugeiconsCompatIcon("FileDiff", "FileDiffIcon");
export const FileImage = createHugeiconsCompatIcon("FileImage");
export const FileJson2 = createHugeiconsCompatIcon("FileJson2", "FileCodeIcon");
export const FilePlus2 = createHugeiconsCompatIcon("FilePlus2", "FilePlusIcon");
export const FileSearch = createHugeiconsCompatIcon("FileSearch");
export const FileText = createHugeiconsCompatIcon("FileText");
export const FileUp = createHugeiconsCompatIcon("FileUp");
export const Film = createHugeiconsCompatIcon("Film");
export const Filter = createHugeiconsCompatIcon("Filter");
export const Fingerprint = createHugeiconsCompatIcon("Fingerprint");
export const FingerprintPattern = createHugeiconsCompatIcon("FingerprintPattern", "FingerprintPatternIcon");
export const Flag = createHugeiconsCompatIcon("Flag");
export const Flame = createHugeiconsCompatIcon("Flame");
export const FlaskConical = createHugeiconsCompatIcon("FlaskConical");
export const Folder = createHugeiconsCompatIcon("Folder");
export const FolderKanban = createHugeiconsCompatIcon("FolderKanban", "FolderKanbanIcon");
export const FolderOpen = createHugeiconsCompatIcon("FolderOpen");
export const FolderPlus = createHugeiconsCompatIcon("FolderPlus");
export const FunctionSquare = createHugeiconsCompatIcon("FunctionSquare", "FunctionSquareIcon");
export const GitBranchPlus = createHugeiconsCompatIcon("GitBranchPlus");
export const GitCommitHorizontal = createHugeiconsCompatIcon("GitCommitHorizontal");
export const GitFork = createHugeiconsCompatIcon("GitFork");
export const GitPullRequestArrow = createHugeiconsCompatIcon("GitPullRequestArrow");
export const Ghost = createHugeiconsCompatIcon("Ghost", "GhostIcon");
export const Gauge = createHugeiconsCompatIcon("Gauge", "GaugeIcon");
export const GitBranch = createHugeiconsCompatIcon("GitBranch");
export const Github = createHugeiconsCompatIcon("Github");
export const Globe = createHugeiconsCompatIcon("Globe");
export const GripVertical = createHugeiconsCompatIcon("GripVertical");
export const Grid3x3 = createHugeiconsCompatIcon("Grid3x3");
export const Hand = createHugeiconsCompatIcon("Hand");
export const HardDrive = createHugeiconsCompatIcon("HardDrive");
export const Heading1 = createHugeiconsCompatIcon("Heading1");
export const Heading2 = createHugeiconsCompatIcon("Heading2");
export const Heading3 = createHugeiconsCompatIcon("Heading3");
export const Heart = createHugeiconsCompatIcon("Heart");
export const History = createHugeiconsCompatIcon("History");
export const House = createHugeiconsCompatIcon("House");
export const Image = createHugeiconsCompatIcon("Image");
export const ImageIcon = createHugeiconsCompatIcon("ImageIcon");
export const ImageOff = createHugeiconsCompatIcon("ImageOff");
export const ImagePlus = createHugeiconsCompatIcon("ImagePlus");
export const Images = createHugeiconsCompatIcon("Images");
export const Info = createHugeiconsCompatIcon("Info");
export const Italic = createHugeiconsCompatIcon("Italic");
export const Key = createHugeiconsCompatIcon("Key");
export const KeyRound = createHugeiconsCompatIcon("KeyRound");
export const LassoSelect = createHugeiconsCompatIcon("LassoSelect");
export const Layers = createHugeiconsCompatIcon("Layers");
export const Layers3 = createHugeiconsCompatIcon("Layers3", "Layers02Icon");
export const LayoutGrid = createHugeiconsCompatIcon("LayoutGrid");
export const LayoutDashboard = createHugeiconsCompatIcon("LayoutDashboard");
export const LibraryBig = createHugeiconsCompatIcon("LibraryBig");
export const Lightbulb = createHugeiconsCompatIcon("Lightbulb");
export const Link2 = createHugeiconsCompatIcon("Link2");
export const List = createHugeiconsCompatIcon("List");
export const ListChecks = createHugeiconsCompatIcon("ListChecks");
export const ListChevronsUpDown = createHugeiconsCompatIcon("ListChevronsUpDown", "ListChevronsDownUpIcon");
export const ListFilter = createHugeiconsCompatIcon("ListFilter");
export const ListOrdered = createHugeiconsCompatIcon("ListOrdered");
export const ListTodo = createHugeiconsCompatIcon("ListTodo");
export const ListTree = createHugeiconsCompatIcon("ListTree");
export const LockKeyhole = createHugeiconsCompatIcon("LockKeyhole", "LockKeyholeIcon");
export const LogIn = createHugeiconsCompatIcon("LogIn");
export const LogOut = createHugeiconsCompatIcon("LogOut");
export const Loader2 = createHugeiconsCompatIcon("Loader2", "Loading03Icon");
export const LoaderCircle = createHugeiconsCompatIcon("LoaderCircle");
export const Mail = createHugeiconsCompatIcon("Mail");
export const MapPin = createHugeiconsCompatIcon("MapPin");
export const Maximize2 = createHugeiconsCompatIcon("Maximize2");
export const MessageCircle = createHugeiconsCompatIcon("MessageCircle");
export const MessageSquare = createHugeiconsCompatIcon("MessageSquare");
export const MessageSquareText = createHugeiconsCompatIcon("MessageSquareText");
export const Metronome = createHugeiconsCompatIcon("Metronome", "MetronomeIcon");
export const Mic = createHugeiconsCompatIcon("Mic");
export const Milestone = createHugeiconsCompatIcon("Milestone");
export const Minimize2 = createHugeiconsCompatIcon("Minimize2");
export const Minus = createHugeiconsCompatIcon("Minus");
export const Monitor = createHugeiconsCompatIcon("Monitor");
export const MousePointer2 = createHugeiconsCompatIcon("MousePointer2");
export const MousePointerClick = createHugeiconsCompatIcon("MousePointerClick");
export const Network = createHugeiconsCompatIcon("Network");
export const Package = createHugeiconsCompatIcon("Package");
export const PackageCheck = createHugeiconsCompatIcon("PackageCheck");
export const Palette = createHugeiconsCompatIcon("Palette", "PaletteIcon");
export const PanelLeft = createHugeiconsCompatIcon("PanelLeft");
export const PanelLeftClose = createHugeiconsCompatIcon("PanelLeftClose");
export const PanelLeftOpen = createHugeiconsCompatIcon("PanelLeftOpen");
export const PanelRight = createHugeiconsCompatIcon("PanelRight");
export const Paintbrush = createHugeiconsCompatIcon("Paintbrush");
export const Paperclip = createHugeiconsCompatIcon("Paperclip");
export const Pause = createHugeiconsCompatIcon("Pause", "PauseIcon");
export const PauseCircle = createHugeiconsCompatIcon("PauseCircle", "PauseCircleIcon");
export const PenTool = createHugeiconsCompatIcon("PenTool");
export const Pencil = createHugeiconsCompatIcon("Pencil");
export const PencilRuler = createHugeiconsCompatIcon("PencilRuler", "PencilRulerIcon");
export const Pilcrow = createHugeiconsCompatIcon("Pilcrow");
export const Pin = createHugeiconsCompatIcon("Pin");
export const Play = createHugeiconsCompatIcon("Play");
export const Plug = createHugeiconsCompatIcon("Plug");
export const Plus = createHugeiconsCompatIcon("Plus");
export const Presentation = createHugeiconsCompatIcon("Presentation");
export const Quote = createHugeiconsCompatIcon("Quote");
export const ReceiptText = createHugeiconsCompatIcon("ReceiptText");
export const RectangleHorizontal = createHugeiconsCompatIcon("RectangleHorizontal");
export const Redo2 = createHugeiconsCompatIcon("Redo2");
export const RefreshCcw = createHugeiconsCompatIcon("RefreshCcw");
export const RefreshCcwDot = createHugeiconsCompatIcon("RefreshCcwDot", "RefreshCcwDotIcon");
export const RefreshCw = createHugeiconsCompatIcon("RefreshCw");
export const Rocket = createHugeiconsCompatIcon("Rocket");
export const RotateCcw = createHugeiconsCompatIcon("RotateCcw");
export const RotateCw = createHugeiconsCompatIcon("RotateCw");
export const Repeat2 = createHugeiconsCompatIcon("Repeat2");
export const Route = createHugeiconsCompatIcon("Route");
export const Rows3 = createHugeiconsCompatIcon("Rows3");
export const Save = createHugeiconsCompatIcon("Save");
export const Scan = createHugeiconsCompatIcon("Scan");
export const ScanEye = createHugeiconsCompatIcon("ScanEye");
export const Search = createHugeiconsCompatIcon("Search");
export const Server = createHugeiconsCompatIcon("Server");
export const Settings = createHugeiconsCompatIcon("Settings");
export const Settings2 = createHugeiconsCompatIcon("Settings2");
export const Share2 = createHugeiconsCompatIcon("Share2");
export const Shield = createHugeiconsCompatIcon("Shield");
export const ShieldAlert = createHugeiconsCompatIcon("ShieldAlert");
export const ShieldCheck = createHugeiconsCompatIcon("ShieldCheck");
export const ShieldOff = createHugeiconsCompatIcon("ShieldOff");
export const Slash = createHugeiconsCompatIcon("Slash", "CircleSlashIcon");
export const SlidersHorizontal = createHugeiconsCompatIcon("SlidersHorizontal");
export const SmilePlus = createHugeiconsCompatIcon("SmilePlus");
export const Sparkles = createHugeiconsCompatIcon("Sparkles");
export const Split = createHugeiconsCompatIcon("Split");
export const Star = createHugeiconsCompatIcon("Star", "StarIcon");
export const Square = createHugeiconsCompatIcon("Square");
export const SquareCode = createHugeiconsCompatIcon("SquareCode");
export const SquareFunction = createHugeiconsCompatIcon("SquareFunction");
export const SquareMousePointer = createHugeiconsCompatIcon("SquareMousePointer", "MousePointerClick");
export const SquareArrowOutUpRight = createHugeiconsCompatIcon("SquareArrowOutUpRight", "ArrowUpRight");
export const SquarePen = createHugeiconsCompatIcon("SquarePen");
export const StickyNote = createHugeiconsCompatIcon("StickyNote");
export const Table2 = createHugeiconsCompatIcon("Table2");
export const Tag = createHugeiconsCompatIcon("Tag");
export const Telescope = createHugeiconsCompatIcon("Telescope");
export const Terminal = createHugeiconsCompatIcon("Terminal");
export const TerminalSquare = createHugeiconsCompatIcon("TerminalSquare", "SquareTerminalIcon");
export const TestTubeDiagonal = createHugeiconsCompatIcon("TestTubeDiagonal", "TestTubeDiagonalIcon");
export const TextQuote = createHugeiconsCompatIcon("TextQuote");
export const ThumbsDown = createHugeiconsCompatIcon("ThumbsDown");
export const ThumbsUp = createHugeiconsCompatIcon("ThumbsUp");
export const Trash2 = createHugeiconsCompatIcon("Trash2");
export const Truck = createHugeiconsCompatIcon("Truck");
export const Type = createHugeiconsCompatIcon("Type");
export const Underline = createHugeiconsCompatIcon("Underline");
export const Undo2 = createHugeiconsCompatIcon("Undo2");
export const Unlink = createHugeiconsCompatIcon("Unlink");
export const Unplug = createHugeiconsCompatIcon("Unplug", "UnplugIcon");
export const Upload = createHugeiconsCompatIcon("Upload");
export const User = createHugeiconsCompatIcon("User");
export const UserRound = createHugeiconsCompatIcon("UserRound");
export const UserRoundMinus = createHugeiconsCompatIcon("UserRoundMinus", "UserRoundMinusIcon");
export const UserRoundPlus = createHugeiconsCompatIcon("UserRoundPlus", "UserRoundPlusIcon");
export const Users = createHugeiconsCompatIcon("Users");
export const UsersRound = createHugeiconsCompatIcon("UsersRound", "UsersRoundIcon");
export const Vault = createHugeiconsCompatIcon("Vault", "VaultIcon");
export const Video = createHugeiconsCompatIcon("Video");
export const Wand2 = createHugeiconsCompatIcon("Wand2", "WandIcon");
export const Webhook = createHugeiconsCompatIcon("Webhook");
export const Workflow = createHugeiconsCompatIcon("Workflow");
export const Wrench = createHugeiconsCompatIcon("Wrench");
export const X = createHugeiconsCompatIcon("X");
export const XCircle = createHugeiconsCompatIcon("XCircle");
export const Zap = createHugeiconsCompatIcon("Zap");
export const ZoomIn = createHugeiconsCompatIcon("ZoomIn");
export const ZoomOut = createHugeiconsCompatIcon("ZoomOut");
