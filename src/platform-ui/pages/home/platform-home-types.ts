import type { LucideIcon } from "lucide-react";
import type { PlatformPageHeroAction } from "../../components/composite/page-hero/index.js";

export type PlatformHomeIconTone = "blue" | "cyan" | "green" | "violet" | "white";

export type PlatformHomeAction = PlatformPageHeroAction;

export interface PlatformHomeLink extends PlatformHomeAction {
  description?: string;
  meta?: string;
}

export interface PlatformHomeFeatureLink extends Omit<PlatformHomeAction, "onClick"> {
  meta?: string;
  onClick?: () => void;
}

export interface PlatformHomeFeatureCard {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconTone?: PlatformHomeIconTone;
  links: readonly PlatformHomeFeatureLink[];
}

export interface PlatformHomeFeatureGridProps {
  cards: readonly PlatformHomeFeatureCard[];
  ariaLabel?: string;
  className?: string;
}

export interface PlatformHomeSection {
  id: string;
  title: string;
  action?: PlatformHomeAction;
  items: readonly PlatformHomeLink[];
}

export interface PlatformHomePageProps {
  title: string;
  description: string;
  headerActions?: readonly PlatformHomeAction[];
  featureCards: readonly PlatformHomeFeatureCard[];
  sections: readonly PlatformHomeSection[];
  ariaLabel?: string;
  className?: string;
}
