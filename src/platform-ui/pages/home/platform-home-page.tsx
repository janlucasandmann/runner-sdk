import { ArrowRight } from "../../components/ui/hugeicons-compat.js";
import { createElement, type ReactNode } from "react";
import { PlatformPageHero } from "../../components/composite/page-hero/index.js";
import { PlatformUiCard } from "../../components/composite/ui-card/index.js";
import type {
  PlatformHomeAction,
  PlatformHomeFeatureCard,
  PlatformHomeFeatureGridProps,
  PlatformHomeFeatureLink,
  PlatformHomeIconTone,
  PlatformHomeLink,
  PlatformHomePageProps,
  PlatformHomeSection,
} from "./platform-home-types.js";

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

function renderIcon(icon: PlatformHomeAction["icon"], size: number): ReactNode {
  if (!icon) return null;
  return createElement(icon, {
    width: size,
    height: size,
    strokeWidth: 1.7,
    "aria-hidden": true,
  });
}

function PlatformHomeFeatureLinkRow({ link }: { link: PlatformHomeFeatureLink }) {
  const content = (
    <>
      <span className="platform-ui-card__feature-link-label">{link.label}</span>
      <span className="platform-ui-card__feature-link-end">
        {link.meta ? (
          <span className="platform-ui-card__feature-link-meta">{link.meta}</span>
        ) : null}
        {link.onClick ? (
          <ArrowRight width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
        ) : null}
      </span>
    </>
  );

  if (!link.onClick) {
    return <div className="platform-ui-card__feature-link is-static">{content}</div>;
  }

  return (
    <button
      type="button"
      className="platform-ui-card__feature-link"
      aria-label={link.ariaLabel || link.label}
      onClick={link.onClick}
    >
      {content}
    </button>
  );
}

function PlatformHomeFeature({ card }: { card: PlatformHomeFeatureCard }) {
  const iconTone: PlatformHomeIconTone = card.iconTone || "blue";

  return (
    <PlatformUiCard as="article" variant="feature" className="platform-home-page__feature-card">
      <span className={`platform-ui-card__feature-icon is-${iconTone}`} aria-hidden="true">
        {renderIcon(card.icon, 34)}
      </span>
      <h2 className="platform-ui-card__feature-title">{card.title}</h2>
      <p className="platform-ui-card__feature-description">{card.description}</p>
      <div className="platform-ui-card__feature-links">
        {card.links.map((link) => (
          <PlatformHomeFeatureLinkRow key={link.id} link={link} />
        ))}
      </div>
    </PlatformUiCard>
  );
}

export function PlatformHomeFeatureGrid({
  cards,
  ariaLabel = "Featured areas",
  className = "",
}: PlatformHomeFeatureGridProps) {
  return (
    <section
      className={joinClassNames("platform-home-page__features", className)}
      aria-label={ariaLabel}
    >
      {cards.map((card) => (
        <PlatformHomeFeature key={card.id} card={card} />
      ))}
    </section>
  );
}

function PlatformHomeSectionItem({ item }: { item: PlatformHomeLink }) {
  return (
    <button
      type="button"
      className="platform-home-page__section-item"
      aria-label={item.ariaLabel || item.label}
      onClick={item.onClick}
    >
      {item.icon ? (
        <span className="platform-home-page__section-item-icon" aria-hidden="true">
          {renderIcon(item.icon, 16)}
        </span>
      ) : null}
      <span className="platform-home-page__section-item-copy">
        <strong>{item.label}</strong>
        {item.description ? <span>{item.description}</span> : null}
      </span>
      {item.meta ? (
        <span className="platform-home-page__section-item-meta">{item.meta}</span>
      ) : null}
    </button>
  );
}

function PlatformHomeLinkSection({ section }: { section: PlatformHomeSection }) {
  return (
    <section
      className="platform-home-page__section"
      aria-labelledby={`platform-home-section-${section.id}`}
    >
      <header className="platform-home-page__section-header">
        <h2
          id={`platform-home-section-${section.id}`}
          className="platform-home-page__section-title"
        >
          {section.title}
        </h2>
        {section.action ? (
          <button
            type="button"
            className="platform-home-page__section-action"
            aria-label={section.action.ariaLabel || section.action.label}
            onClick={section.action.onClick}
          >
            {renderIcon(section.action.icon, 14)}
            <span>{section.action.label}</span>
          </button>
        ) : null}
      </header>
      <div className="platform-home-page__section-list">
        {section.items.map((item) => (
          <PlatformHomeSectionItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export function PlatformHomePage({
  title,
  description,
  headerActions = [],
  featureCards,
  sections,
  ariaLabel = "Home",
  className = "",
}: PlatformHomePageProps) {
  return (
    <main
      className={joinClassNames("platform-home-page", className)}
      aria-label={ariaLabel}
      data-platform-home-page="true"
    >
      <div className="platform-home-page__inner">
        <PlatformPageHero title={title} description={description} actions={headerActions} />

        <PlatformHomeFeatureGrid cards={featureCards} />

        <div className="platform-home-page__sections">
          {sections.map((section) => (
            <PlatformHomeLinkSection key={section.id} section={section} />
          ))}
        </div>
      </div>
    </main>
  );
}
