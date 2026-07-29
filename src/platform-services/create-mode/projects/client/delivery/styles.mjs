export const PROJECT_DELIVERY_WORKSPACE_CSS = String.raw`
.project-delivery-workspace {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 24px;
  color: #fff;
}

.project-delivery-workspace__loading {
  min-height: 420px;
}

.project-delivery-workspace__cards {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 16px;
}

.project-delivery-workspace__cards > .platform-ui-card {
  min-height: 390px;
}

.project-delivery-workspace__field {
  display: grid;
  gap: 7px;
  margin-top: 12px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 11px;
}

.project-delivery-workspace__field textarea {
  box-sizing: border-box;
  width: 100%;
  resize: vertical;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 10px;
  padding: 10px 12px;
  color: rgba(255, 255, 255, 0.92);
  background: rgba(0, 0, 0, 0.24);
  font: inherit;
  font-size: 12px;
  line-height: 1.5;
}

.project-delivery-workspace__field textarea:focus-visible {
  border-color: rgba(77, 163, 255, 0.7);
  outline: none;
  box-shadow: 0 0 0 2px rgba(77, 163, 255, 0.14);
}

.project-delivery-workspace__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 16px;
}

.project-delivery-workspace__status-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.project-delivery-workspace__metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.075);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.075);
}

.project-delivery-workspace__metrics > div {
  padding: 13px 14px;
  background: rgba(0, 0, 0, 0.28);
}

.project-delivery-workspace__metrics dt {
  color: rgba(255, 255, 255, 0.48);
  font-size: 10px;
}

.project-delivery-workspace__metrics dd {
  margin: 5px 0 0;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-delivery-workspace__issues {
  display: grid;
  gap: 8px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}

.project-delivery-workspace__issues li {
  display: grid;
  gap: 3px;
  border-left: 2px solid rgba(250, 204, 21, 0.65);
  padding-left: 10px;
  font-size: 11px;
}

.project-delivery-workspace__issues span {
  color: rgba(255, 255, 255, 0.58);
}

.project-delivery-workspace__applied,
.project-delivery-workspace__evidence-reference {
  display: flex;
  align-items: center;
  gap: 7px;
}

.project-delivery-workspace__applied {
  margin-top: auto;
  padding-top: 16px;
  color: rgba(133, 223, 123, 0.92);
  font-size: 11px;
}

.project-delivery-workspace code {
  overflow: hidden;
  color: rgba(255, 255, 255, 0.44);
  font: inherit;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-delivery-workspace__error {
  margin-top: 14px;
  border: 1px solid rgba(248, 113, 113, 0.28);
  border-radius: 10px;
  padding: 10px 12px;
  color: rgba(248, 113, 113, 0.95);
  background: rgba(127, 29, 29, 0.14);
  font-size: 11px;
}

.project-delivery-workspace__campaigns {
  margin-top: 28px;
}

.project-delivery-workspace__section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 10px;
}

.project-delivery-workspace__section-heading > span {
  display: flex;
  align-items: center;
  gap: 9px;
}

.project-delivery-workspace__section-heading h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.project-delivery-workspace__section-heading p {
  margin: 0;
  color: rgba(255, 255, 255, 0.48);
  font-size: 10px;
}

.project-delivery-workspace__campaign-name {
  display: grid;
  gap: 3px;
}

.project-delivery-workspace__attempts {
  display: grid;
  gap: 1px;
  padding: 4px 16px 12px 42px;
}

.project-delivery-workspace__attempt {
  display: grid;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.065);
  padding: 12px 0;
}

.project-delivery-workspace__attempt-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
}

.project-delivery-workspace__attempt-heading > span:last-child {
  margin-left: auto;
  color: rgba(255, 255, 255, 0.62);
}

.project-delivery-workspace__evidence {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
}

.project-delivery-workspace__evidence-reference {
  min-width: 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 9px;
}

.project-delivery-workspace__attempt-error {
  color: rgba(248, 113, 113, 0.86);
  font-size: 10px;
}

.project-delivery-workspace__attempt-empty {
  padding: 14px 0;
  color: rgba(255, 255, 255, 0.48);
  font-size: 10px;
}

@media (max-width: 980px) {
  .project-delivery-workspace__cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .project-delivery-workspace {
    padding: 16px;
  }

  .project-delivery-workspace__section-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
`;
