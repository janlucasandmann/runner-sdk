export const PROJECT_ACTIVITY_FEED_CSS_FRAGMENT = String.raw`
  .playground-project-activity-feed {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
    width: 100%;
    padding: 4px 0 36px;
  }

  .playground-project-activity-feed__heading {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;
    width: 100%;
    min-width: 0;
  }

  .playground-project-activity-feed__title {
    margin: 0;
    color: #fff;
    font-size: 16px;
    font-weight: 400;
    line-height: 1.3;
  }

  .playground-project-activity-feed__filter.platform-icon-button {
    flex: 0 0 auto;
    color: rgba(255, 255, 255, 0.62);
    background: transparent;
  }

  .playground-project-activity-feed__filter.platform-icon-button:hover,
  .playground-project-activity-feed__filter.platform-icon-button.is-active {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }

  .playground-project-activity-feed__latest-update {
    width: 100%;
    min-width: 0;
    margin-top: -12px;
  }

  .playground-project-activity-feed__latest-update > .platform-project-update-card {
    margin-top: 0;
    background: rgba(255, 255, 255, 0.075);
  }

  .playground-project-timeline-filter-menu.platform-popup-surface {
    width: min(340px, calc(100vw - 32px));
    padding: 8px;
  }

  .playground-project-timeline-filter-menu__header {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 8px 10px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.075);
  }

  .playground-project-timeline-filter-menu__title,
  .playground-project-timeline-filter-menu__label {
    color: #fff;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.4;
  }

  .playground-project-timeline-filter-menu__description,
  .playground-project-timeline-filter-menu__row-description {
    color: rgba(255, 255, 255, 0.5);
    font-size: 11px;
    font-weight: 400;
    line-height: 1.4;
  }

  .playground-project-timeline-filter-menu__list {
    display: flex;
    flex-direction: column;
    padding-top: 6px;
  }

  .playground-project-timeline-filter-menu__row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    min-width: 0;
    padding: 8px 10px;
    border-radius: 8px;
  }

  .playground-project-timeline-filter-menu__row:hover {
    background: rgba(255, 255, 255, 0.075);
  }

  .playground-project-timeline-filter-menu__copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .playground-project-activity-feed__month {
    margin: 0;
    color: rgba(255, 255, 255, 0.96);
    font-weight: 400;
  }

  .playground-project-activity-feed__groups,
  .playground-project-activity-feed__group,
  .playground-project-activity-feed__events {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .playground-project-activity-feed__groups {
    gap: 42px;
  }

  .playground-project-activity-feed__group {
    gap: 20px;
  }

  .playground-project-activity-feed__month {
    padding: 0 4px;
    font-size: 16px;
  }

  .playground-project-activity-feed__events {
    gap: 24px;
  }

  .playground-project-activity-line {
    position: relative;
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    align-items: center;
    gap: 10px;
    min-height: 34px;
    padding: 2px 4px;
    border-radius: 9px;
    color: rgba(255, 255, 255, 0.62);
    font-size: 13px;
    line-height: 1.45;
  }

  .platform-activity-timeline__item.playground-tasks-activity-shared-line-item {
    box-sizing: border-box;
    position: relative;
    display: block;
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    min-height: 34px;
  }

  .platform-activity-timeline__item.playground-tasks-activity-shared-line-item
    > .playground-project-activity-line {
    width: 100%;
    max-width: 100%;
  }

  .playground-project-activity-line.has-avatar {
    grid-template-columns: 20px minmax(0, 1fr);
    gap: 6px;
  }

  .playground-project-activity-line.has-avatar .playground-project-activity-line__leading {
    width: 20px;
    min-width: 20px;
    max-width: 20px;
    justify-content: flex-start;
  }

  .playground-project-activity-line.is-interactive {
    cursor: pointer;
    transition: background-color 120ms ease, color 120ms ease;
  }

  .playground-project-activity-line.is-interactive:hover,
  .playground-project-activity-line.is-interactive:focus-visible {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.62);
    outline: none;
  }

  .playground-project-activity-line__leading {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    min-width: 28px;
    max-width: 28px;
    height: 28px;
    min-height: 28px;
    max-height: 28px;
    overflow: hidden;
  }

  .playground-project-activity-line__avatar-shell {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    min-width: 20px;
    max-width: 20px;
    height: 20px;
    min-height: 20px;
    max-height: 20px;
    overflow: hidden;
    flex: 0 0 20px;
    border-radius: 50%;
  }

  .playground-project-activity-line__avatar,
  .playground-project-activity-line__avatar-shell > *,
  .playground-project-activity-line__avatar-shell img,
  .playground-project-activity-line__avatar-shell picture,
  .playground-project-activity-line__avatar-shell picture > img {
    width: 20px !important;
    min-width: 20px !important;
    max-width: 20px !important;
    height: 20px !important;
    min-height: 20px !important;
    max-height: 20px !important;
    box-sizing: border-box;
    overflow: hidden;
    flex: 0 0 20px !important;
    border-radius: 50% !important;
    object-fit: cover !important;
  }

  .playground-project-activity-line__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.075);
    color: rgba(255, 255, 255, 0.66);
  }

  .playground-project-activity-line__body {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    min-width: 0;
    gap: 0;
  }

  .playground-project-activity-line__summary {
    min-width: 0;
  }

  .playground-project-activity-line__summary strong {
    color: rgba(255, 255, 255, 0.62);
    font-weight: 500;
  }

  .playground-project-activity-line__subject {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    overflow: hidden;
    min-width: 0;
    color: rgba(255, 255, 255, 0.62);
    margin-inline-start: 6px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .playground-project-activity-line__assignee {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    color: rgba(255, 255, 255, 0.62);
    margin-inline-start: 3px;
    font-weight: 400;
    white-space: nowrap;
  }

  .playground-project-activity-line__assignee-separator {
    color: rgba(255, 255, 255, 0.62);
    white-space: pre;
  }

  .playground-project-activity-line__rename-separator,
  .playground-project-activity-line__priority-separator,
  .playground-project-activity-line__status-separator {
    color: rgba(255, 255, 255, 0.62);
    white-space: pre;
  }

  .playground-project-activity-line__renamed-title {
    color: rgba(255, 255, 255, 0.62);
    font-weight: 400;
  }

  .playground-project-activity-line__priority {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: rgba(255, 255, 255, 0.62);
    margin-inline-start: 4px;
    white-space: nowrap;
  }

  .playground-project-activity-line__priority .playground-tasks-priority-value {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
  }

  .playground-project-activity-line__status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: rgba(255, 255, 255, 0.62);
    margin-inline-start: 4px;
    white-space: nowrap;
  }

  .playground-project-activity-line__status .playground-tasks-status-value {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
  }

  .playground-project-activity-line__milestone {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    color: rgba(255, 255, 255, 0.62);
    margin-inline-start: 4px;
    white-space: nowrap;
  }

  .playground-project-activity-line__milestone-separator {
    color: rgba(255, 255, 255, 0.62);
    white-space: pre;
  }

  .playground-project-activity-line__time {
    color: rgba(255, 255, 255, 0.62);
    margin-inline-start: 4px;
    white-space: nowrap;
  }

  .playground-project-activity-rich-card {
    width: 100%;
    box-sizing: border-box;
  }

  .playground-project-activity-rich-card.platform-project-update-card,
  .playground-project-activity-rich-card.is-project-update > .platform-project-update-card {
    width: 100%;
    margin-top: 0;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.075);
  }

  .playground-project-activity-ticket-comment.platform-comment-card {
    padding: 18px 20px;
  }

  .playground-project-activity-ticket-comment .platform-comment-card__author {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
  }

  .playground-project-activity-ticket-comment__verb {
    color: rgba(255, 255, 255, 0.62);
  }

  .playground-project-activity-ticket-comment__ticket {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
    color: #fff;
    font: inherit;
    background: transparent;
    cursor: pointer;
  }

  .playground-project-activity-ticket-comment__ticket:disabled {
    cursor: default;
  }

  .playground-project-activity-ticket-comment__body {
    color: rgba(255, 255, 255, 0.82);
  }

  .playground-project-activity-rich-card__kind {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #fff;
    font-size: 12px;
    font-weight: 400;
  }

  .playground-project-activity-rich-card__kind-icon {
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 20px;
    border-radius: 5px;
    color: #fff;
  }

  .playground-project-activity-rich-card__kind-icon.is-mission-control {
    background: linear-gradient(180deg, #3159a8 0%, #172f68 100%);
    box-shadow: inset 0 0 0 1px rgba(137, 178, 255, 0.16), 0 1px 2px rgba(0, 0, 0, 0.28);
  }

  .playground-project-activity-rich-card__kind-icon.is-milestone {
    background: linear-gradient(180deg, #287c4d 0%, #17492f 100%);
    box-shadow: inset 0 0 0 1px rgba(126, 255, 184, 0.14), 0 1px 2px rgba(0, 0, 0, 0.28);
  }

  .playground-project-activity-rich-card__kind-icon svg {
    filter: drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.28));
  }

  .playground-project-activity-rich-card__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 4px 0 2px;
    color: rgba(255, 255, 255, 0.78);
  }

  .playground-project-activity-rich-card__content .tb-message-markdown {
    font-size: 14px;
    line-height: 1.6;
  }

  .playground-project-activity-rich-card.is-milestone .playground-project-activity-rich-card__content {
    gap: 0;
  }

  .playground-project-activity-rich-card.is-milestone .playground-project-activity-rich-card__content .tb-message-markdown {
    margin-top: 6px;
    color: rgba(255, 255, 255, 0.62);
  }

  .playground-project-activity-rich-card.is-milestone .playground-project-activity-rich-card__content .tb-message-markdown > :first-child {
    margin-top: 0;
  }

  .playground-project-activity-rich-card__milestone-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-width: 0;
  }

  .playground-project-activity-rich-card__milestone-title {
    min-width: 0;
    overflow: hidden;
    color: #fff;
    font-size: 14px;
    line-height: 1.4;
    font-weight: 400;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .playground-project-activity-rich-card__milestone-progress {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    flex: 0 0 auto;
  }

  .playground-project-activity-rich-card__milestone-progress .playground-project-overview-milestones-card__progress {
    width: 18px;
    height: 18px;
    background:
      radial-gradient(circle at center, #131313 52%, transparent 54%),
      conic-gradient(
        #636bdc 0 var(--project-milestone-progress, 0%),
        rgba(255, 255, 255, 0.12) var(--project-milestone-progress, 0%) 100%
      );
  }

  .playground-project-activity-rich-card__milestone-progress-label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 18px;
    padding: 0;
    border-radius: 0;
    background: transparent;
    color: rgba(255, 255, 255, 0.82);
    font-size: 12px;
    line-height: 1.35;
    font-weight: 400;
    white-space: nowrap;
  }

  .playground-project-activity-rich-card__mission-control-lines {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .playground-project-activity-rich-card__mission-control-line {
    display: flex;
    align-items: center;
    gap: 9px;
    min-height: 24px;
    color: rgba(255, 255, 255, 0.82);
    font-size: 14px;
    line-height: 1.45;
  }

  .playground-project-activity-rich-card__mission-control-line-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    min-width: 20px;
    border-radius: 5px;
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.09);
  }

  .playground-project-activity-rich-card__mission-control-line-icon.is-issues {
    color: #8dc4ff;
    background: rgba(49, 89, 168, 0.28);
  }

  .playground-project-activity-rich-card__mission-control-line-icon.is-strategy {
    color: #c0a5ff;
    background: rgba(112, 82, 170, 0.26);
  }

  .playground-project-activity-rich-card__mission-control-line-icon.is-milestones {
    color: #f1c66a;
    background: rgba(151, 108, 23, 0.26);
  }

  .playground-project-activity-rich-card__mission-control-line-icon.is-knowledge {
    color: #8fe1c0;
    background: rgba(38, 133, 93, 0.26);
  }

  .playground-project-activity-rich-card__mission-control-empty {
    color: rgba(255, 255, 255, 0.48);
    font-size: 14px;
  }

  .playground-project-activity-rich-card__progress {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.075);
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
  }

  .playground-project-activity-feed__loading,
  .playground-project-activity-feed__empty {
    min-height: 220px;
  }

  .playground-project-activity-feed__incremental-loading {
    min-height: 52px;
    width: 100%;
  }

  .playground-project-timeline-settings__list {
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 15px;
    background: rgba(255, 255, 255, 0.05);
  }

  .playground-project-timeline-settings .playground-project-settings-section__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 12px;
  }

  .playground-project-timeline-settings .playground-project-settings-section__title {
    margin: 0 0 8px;
    color: rgba(255, 255, 255, 0.94);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.45;
  }

  .playground-project-timeline-settings .playground-project-settings-section__description {
    margin: 4px 0 0;
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    line-height: 1.45;
  }

  .playground-project-timeline-settings__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    min-height: 62px;
    padding: 20px;
    box-sizing: border-box;
  }

  .playground-project-timeline-settings__row + .playground-project-timeline-settings__row {
    border-top: 1px solid rgba(255, 255, 255, 0.075);
  }

  .playground-project-timeline-settings__copy {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 3px;
  }

  .playground-project-timeline-settings__label {
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    font-weight: 400;
  }

  .playground-project-timeline-settings__description {
    color: rgba(255, 255, 255, 0.48);
    font-size: 12px;
    line-height: 1.4;
  }

  @media (max-width: 720px) {
    .playground-project-activity-feed__header {
      align-items: stretch;
      flex-direction: column;
    }

    .playground-project-activity-line {
      grid-template-columns: 28px minmax(0, 1fr);
    }

    .playground-project-activity-line__body {
      align-items: flex-start;
      gap: 2px 8px;
    }
  }
`;
