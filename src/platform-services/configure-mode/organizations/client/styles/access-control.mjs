export const ORGANIZATIONS_ACCESS_CONTROL_CSS = `
.organization-access-control {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  min-width: 0;
  padding-bottom: 36px;
}

.organization-access-control__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.organization-access-control__header > div:first-child {
  min-width: 0;
  max-width: 760px;
}

.organization-access-control__eyebrow {
  display: block;
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  line-height: 1.3;
}

.organization-access-control__header h2 {
  margin: 0;
  color: #fff;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.3;
}

.organization-access-control__header p {
  margin: 7px 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  line-height: 1.55;
}

.organization-access-control__header .platform-switch {
  flex: 0 0 auto;
}

.organization-access-control__section-intro {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 20px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 11px;
  line-height: 1.45;
}

.organization-access-control__section-intro svg {
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
}

.organization-access-control__content {
  min-width: 0;
}

.organization-access-control__notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 34px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
}

.organization-access-control__notice.is-success {
  border-color: rgba(133, 223, 123, 0.22);
  background: rgba(133, 223, 123, 0.08);
  color: #85df7b;
}

.organization-access-control__notice.is-error {
  border-color: rgba(245, 59, 58, 0.24);
  background: rgba(245, 59, 58, 0.08);
  color: #ff8d8c;
}

.organization-access-control__notice button {
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.organization-access-control__identity {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.organization-access-control__avatar {
  display: inline-grid;
  place-items: center;
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  overflow: hidden;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.78);
  font-size: 8px;
}

.organization-access-control__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.organization-access-control__identity-copy,
.organization-access-control__stacked-value {
  display: inline-flex;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
  color: #fff;
}

.organization-access-control__identity-copy > span,
.organization-access-control__stacked-value > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.organization-access-control__identity-copy small,
.organization-access-control__stacked-value small {
  overflow: hidden;
  color: rgba(255, 255, 255, 0.5);
  font-size: 10px;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.organization-access-control__form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.organization-access-control__form-grid,
.organization-access-control__claim-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.organization-access-control__field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.organization-access-control__field-label {
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  line-height: 1.3;
}

.organization-access-control__field-description {
  margin-top: -3px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 10px;
  line-height: 1.35;
}

.organization-access-control__input {
  box-sizing: border-box;
  width: 100%;
  min-height: 36px;
  padding: 8px 11px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  outline: 0;
  background: rgba(255, 255, 255, 0.075);
  color: #fff;
  font: inherit;
  font-size: 12px;
  letter-spacing: 0;
}

.organization-access-control__input:focus {
  border-color: rgba(77, 163, 255, 0.72);
}

.organization-access-control__input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.organization-access-control__subsection {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.organization-access-control__subsection h3 {
  margin: 0;
  color: #fff;
  font-size: 14px;
  font-weight: 400;
}

.organization-access-control__subsection > p {
  margin: -5px 0 0;
  color: rgba(255, 255, 255, 0.52);
  font-size: 11px;
  line-height: 1.45;
}

.organization-access-control__action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.organization-access-control__action-option {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.075);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.72);
  text-align: left;
  cursor: pointer;
}

.organization-access-control__action-option:hover,
.organization-access-control__action-option.is-selected {
  background: rgba(255, 255, 255, 0.085);
}

.organization-access-control__action-option > span:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.organization-access-control__action-option strong {
  color: #fff;
  font-size: 11px;
  font-weight: 400;
}

.organization-access-control__action-option small {
  overflow: hidden;
  color: rgba(255, 255, 255, 0.42);
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.organization-access-control__secret {
  display: block;
  overflow-wrap: anywhere;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: #000;
  color: #fff;
  font-size: 12px;
  line-height: 1.55;
  user-select: all;
}

.organization-access-control__explanation {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.organization-access-control__decision-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 28px;
}

.organization-access-control__decision-summary > span:nth-child(2) {
  color: #fff;
  font-size: 12px;
}

.organization-access-control__decision-summary time {
  margin-left: auto;
  color: rgba(255, 255, 255, 0.5);
  font-size: 10px;
}

.organization-access-control__metadata {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.075);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.075);
}

.organization-access-control__metadata > div {
  min-width: 0;
  padding: 10px 12px;
  background: #0a0a0a;
}

.organization-access-control__metadata dt {
  color: rgba(255, 255, 255, 0.45);
  font-size: 9px;
}

.organization-access-control__metadata dd {
  overflow: hidden;
  margin: 4px 0 0;
  color: #fff;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.organization-access-control__steps {
  display: flex;
  flex-direction: column;
}

.organization-access-control__step {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: start;
  gap: 10px;
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.organization-access-control__step > span:first-child {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.65);
  font-size: 9px;
}

.organization-access-control__step strong {
  color: #fff;
  font-size: 11px;
  font-weight: 400;
}

.organization-access-control__step p {
  margin: 4px 0 0;
  color: rgba(255, 255, 255, 0.58);
  font-size: 10px;
  line-height: 1.45;
}

@media (max-width: 820px) {
  .organization-access-control__header {
    align-items: stretch;
    flex-direction: column;
  }

  .organization-access-control__header .platform-switch {
    width: 100%;
  }

  .organization-access-control__form-grid,
  .organization-access-control__claim-grid,
  .organization-access-control__action-grid,
  .organization-access-control__metadata {
    grid-template-columns: minmax(0, 1fr);
  }
}
`;
