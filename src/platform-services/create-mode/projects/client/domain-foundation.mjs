import { PROJECT_TYPE_ALIASES, PROJECT_TYPE_REGISTRY } from "../catalog.mjs";

export const PROJECTS_DOMAIN_FOUNDATION_SCRIPT = `
      const PLAYGROUND_TASK_BOARD_UNSCHEDULED_ID = "__playground_unscheduled_sprint__";
      const PLAYGROUND_PROJECT_VIEW_OPTIONS = [
        { id: "overview", label: "General", icon: LayoutDashboard },
        { id: "backlog", label: "Backlog", icon: ListTodo },
        { id: "board", label: "Board", icon: LayoutGrid },
        { id: "calendar", label: "Calendar", icon: Clock },
      ];
	      const PLAYGROUND_TASK_STATUS_OPTIONS = [
	        { id: "backlog", label: "Backlog", icon: CircleDashed, toneClassName: "is-backlog", manual: true },
	        { id: "todo", label: "Todo", icon: Circle, toneClassName: "is-todo", manual: true },
	        { id: "in_progress", label: "In Progress", icon: CircleEllipsis, toneClassName: "is-in-progress", manual: true },
	        { id: "done", label: "Done", icon: CircleCheck, toneClassName: "is-done", manual: true },
	        { id: "canceled", label: "Canceled", icon: CircleMinus, toneClassName: "is-canceled", manual: true },
	        { id: "blocked", label: "Blocked", icon: AlertCircle, toneClassName: "is-blocked", manual: false },
	        { id: "in_review", label: "In Review", icon: CircleEllipsis, toneClassName: "is-in-review", manual: false },
	      ];
	      const PLAYGROUND_TASK_MANUAL_STATUS_OPTIONS = PLAYGROUND_TASK_STATUS_OPTIONS.filter((option) => option.manual);
	      const PLAYGROUND_TASK_TERMINAL_STATUS_IDS = new Set(["done", "canceled"]);

	      function isPlaygroundTaskTerminalStatus(status) {
	        return PLAYGROUND_TASK_TERMINAL_STATUS_IDS.has(String(status || "").trim().toLowerCase());
	      }
      const PLAYGROUND_TASK_PRIORITY_OPTIONS = [
        { id: "low", label: "Low" },
        { id: "medium", label: "Medium" },
        { id: "high", label: "High" },
        { id: "urgent", label: "Urgent" },
      ];
      const PLAYGROUND_TASK_TYPE_OPTIONS = [
        { id: "task", label: "Task" },
        { id: "subtask", label: "Subtask" },
        { id: "loop", label: "Loop" },
      ];
      const PLAYGROUND_TASK_COLOR_OPTIONS = [
        {
          id: "gray",
          label: "Gray",
          accent: "rgba(255, 255, 255, 0.92)",
          surface: "rgba(255, 255, 255, 0.05)",
          surfaceHover: "rgba(255, 255, 255, 0.07)",
          surfaceActive: "rgba(255, 255, 255, 0.1)",
          border: "rgba(255, 255, 255, 0.08)",
          text: "rgba(255, 255, 255, 0.96)",
        },
        {
          id: "blue",
          label: "Blue",
          accent: "#016bcb",
          surface: "rgba(1, 107, 203, 0.12)",
          surfaceHover: "rgba(1, 107, 203, 0.16)",
          surfaceActive: "rgba(1, 107, 203, 0.22)",
          border: "rgba(1, 107, 203, 0.2)",
          text: "rgba(184, 224, 255, 0.98)",
        },
        {
          id: "green",
          label: "Green",
          accent: "#2ca36b",
          surface: "rgba(44, 163, 107, 0.12)",
          surfaceHover: "rgba(44, 163, 107, 0.16)",
          surfaceActive: "rgba(44, 163, 107, 0.22)",
          border: "rgba(44, 163, 107, 0.2)",
          text: "rgba(194, 246, 220, 0.98)",
        },
        {
          id: "amber",
          label: "Amber",
          accent: "#c98a1f",
          surface: "rgba(201, 138, 31, 0.12)",
          surfaceHover: "rgba(201, 138, 31, 0.16)",
          surfaceActive: "rgba(201, 138, 31, 0.22)",
          border: "rgba(201, 138, 31, 0.2)",
          text: "rgba(255, 230, 180, 0.98)",
        },
        {
          id: "rose",
          label: "Rose",
          accent: "#c45b87",
          surface: "rgba(196, 91, 135, 0.12)",
          surfaceHover: "rgba(196, 91, 135, 0.16)",
          surfaceActive: "rgba(196, 91, 135, 0.22)",
          border: "rgba(196, 91, 135, 0.2)",
          text: "rgba(255, 214, 230, 0.98)",
        },
      ];
      const PLAYGROUND_TASK_HUMAN_ME_ID = "__runner_playground_human_me__";
      const PLAYGROUND_PROJECT_WALLPAPER_OPTIONS = [
        { id: "mountains", name: "Mountains", url: "/img/bg/mountain.avif", thumbnail: "/img/bg/mountain.avif" },
        { id: "aurora", name: "Road", url: "/img/bg/road.avif", thumbnail: "/img/bg/road.avif?auto=compress&cs=tinysrgb&w=300" },
        { id: "desert", name: "Desert", url: "/img/bg/newdesert.avif", thumbnail: "/img/bg/newdesert.avif" },
        { id: "ocean", name: "Ocean", url: "/img/bg/water.avif", thumbnail: "/img/bg/water.avif" },
        { id: "forest", name: "Color Blend", url: "/img/bg/blend.avif", thumbnail: "/img/bg/blend.avif" },
        { id: "night-sky", name: "Dune", url: "/img/bg/dune.avif", thumbnail: "/img/bg/dune.avif" },
        { id: "abstract-dark", name: "Abstract Dark", url: "/img/bg/bg-abstract.avif", thumbnail: "/img/bg/bg-abstract.avif?auto=compress&cs=tinysrgb&w=300" },
        { id: "gradient-orange", name: "Moon", url: "/img/bg/moon.avif", thumbnail: "/img/bg/moon.avif" },
      ];
      const PLAYGROUND_PROJECT_ACCENT_COLORS = [
        "#79d0ff",
        "#f67ab7",
        "#9b8bff",
        "#55d8a5",
        "#f4b85f",
      ];
      const PLAYGROUND_PROJECT_ICON_OPTIONS = [
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
      ];
      const PLAYGROUND_PROJECT_BLUEPRINT_PROFILE_DATA = ${JSON.stringify(PROJECT_TYPE_REGISTRY)};
      const PLAYGROUND_PROJECT_BLUEPRINT_ALIASES = ${JSON.stringify(PROJECT_TYPE_ALIASES)};
`;
