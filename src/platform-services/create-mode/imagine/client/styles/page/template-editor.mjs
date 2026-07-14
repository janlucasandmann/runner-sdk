export const IMAGINE_PAGE_TEMPLATE_EDITOR_CSS = String.raw`      .playground-imagine-create-page {
        width: min(760px, calc(100% - 48px));
        margin: auto;
        padding: 0;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-imagine-create-back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.68);
        padding: 0;
        font-size: 12px;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-imagine-create-back.playground-imagine-template-back.is-icon-only {
        position: fixed;
      }

      .playground-imagine-create-header {
        margin: 28px 0 24px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 24px;
      }

      .playground-imagine-create-header h2 {
        margin: 0;
        font-size: 28px;
        line-height: 1.08;
        font-weight: 500;
        letter-spacing: -0.03em;
      }

      .playground-imagine-create-header p {
        margin: 8px 0 0;
        max-width: 420px;
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        line-height: 1.5;
      }

      .playground-imagine-template-form {
        position: relative;
        overflow: visible;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.1);
        padding: 18px;
      }

      .playground-imagine-template-form::before {
        content: none;
        display: none;
      }

      .playground-imagine-form-grid {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .playground-imagine-create-settings {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .playground-imagine-create-settings .playground-imagine-template-style-picker {
        margin: 0;
      }

      .playground-imagine-form-fields {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .playground-imagine-create-title-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .playground-imagine-create-title-section .playground-imagine-template-section-title {
        color: rgba(255, 255, 255, 0.86);
      }

      .playground-imagine-create-title-input {
        width: 100%;
        height: 38px;
        border: 0;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.94);
        outline: none;
        padding: 0 12px;
        box-sizing: border-box;
        font: inherit;
        font-size: 13px;
        font-weight: 400;
      }

      .playground-imagine-create-title-input:focus {
        box-shadow: inset 0 0 0 1px rgba(102, 166, 255, 0.56);
      }

      .playground-imagine-create-markdown-section {
        margin: 0;
        padding: 0;
      }

      .playground-imagine-create-markdown-section .playground-tasks-detail-section-header {
        margin-bottom: 10px;
      }

      .playground-imagine-create-markdown-section .playground-tasks-detail-section-title {
        color: rgba(255, 255, 255, 0.92);
        font-size: 14px;
        font-weight: 400;
        line-height: 1.3;
      }

      .playground-imagine-create-markdown-editor {
        min-height: 88px;
        overflow: visible;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
      }

      .playground-imagine-create-markdown-editor::before {
        content: none;
        display: none;
      }

      .playground-imagine-create-markdown-input {
        min-height: 88px;
        padding: 0 0 9px;
        color: rgba(255, 255, 255, 0.7);
        overflow: auto;
      }

      .playground-imagine-create-markdown-section.is-description .playground-imagine-create-markdown-editor,
      .playground-imagine-create-markdown-section.is-description .playground-imagine-create-markdown-input {
        min-height: 30px;
        height: 30px;
      }

      .playground-imagine-create-reference-section .playground-imagine-template-attachments-toolbar {
        margin-bottom: 12px;
      }

      .playground-imagine-create-reference-section .playground-imagine-template-from-computer {
        border: 0;
        background: transparent;
        color: #66a6ff;
        padding: 0;
        font: inherit;
        font-size: 12px;
        line-height: 1.2;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-imagine-create-reference-section .playground-imagine-template-from-computer:disabled {
        cursor: default;
        opacity: 0.55;
      }

      .playground-imagine-create-file-browser-runner {
        display: none;
      }

      .playground-imagine-form-field {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .playground-imagine-form-field label {
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
      }

      .playground-imagine-form-input,
      .playground-imagine-form-textarea {
        width: 100%;
        border: 0;
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.32);
        color: rgba(255, 255, 255, 0.94);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
        font-size: 13px;
        line-height: 1.45;
        font-weight: 400;
        outline: none;
      }

      .playground-imagine-form-input {
        height: 40px;
        padding: 0 12px;
      }

      .playground-imagine-form-textarea {
        min-height: 94px;
        resize: vertical;
        padding: 11px 12px;
      }

      .playground-imagine-upload-card {
        position: relative;
        min-height: 166px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        border: 1px dashed rgba(255, 255, 255, 0.22);
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.22);
        overflow: hidden;
        text-align: center;
        cursor: pointer;
      }

      .playground-imagine-create-upload-surface {
        position: relative;
        min-height: 166px;
      }

      .playground-imagine-create-reference-section .playground-tasks-attachments {
        padding-top: 0;
      }

      .playground-imagine-create-reference-section .playground-tasks-attachments-surface.tb-runner-chat,
      .playground-imagine-create-reference-section .playground-tasks-attachments-surface.tb-runner-chat .tb-popup-dropzone {
        min-height: 166px;
      }

      .playground-imagine-create-reference-section .playground-tasks-attachments-dropzone.is-filled {
        min-height: 166px;
      }

      .playground-imagine-create-reference-section .runner-attachment-image-button {
        border: 0;
        padding: 0;
        background: transparent;
        cursor: default;
      }

      .playground-imagine-create-reference-section .runner-attachment-file-button {
        cursor: default;
      }

      .playground-imagine-create-reference-section .runner-attachment-file-icon-slot svg {
        width: 18px;
        height: 18px;
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-imagine-create-upload-dropzone input {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
      }

      .playground-imagine-create-upload-preview {
        position: absolute;
        inset: 8px;
        border-radius: 8px;
        overflow: hidden;
        z-index: 0;
        opacity: 0.62;
      }

      .playground-imagine-create-upload-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .playground-imagine-create-upload-dropzone > svg,
      .playground-imagine-create-upload-dropzone > span {
        position: relative;
        z-index: 1;
      }

      .playground-imagine-upload-card input {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
      }

      .playground-imagine-upload-card img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .playground-imagine-upload-card svg,
      .playground-imagine-upload-card span,
      .playground-imagine-upload-card small {
        position: relative;
        z-index: 1;
      }

      .playground-imagine-upload-card span {
        color: rgba(255, 255, 255, 0.86);
        font-size: 13px;
        font-weight: 400;
      }

      .playground-imagine-upload-card small {
        color: rgba(255, 255, 255, 0.48);
        font-size: 11px;
        line-height: 1.4;
      }

      .playground-imagine-form-actions {
        margin-top: 18px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
      }

      .playground-imagine-form-error {
        margin-right: auto;
        color: rgba(255, 132, 132, 0.92);
        font-size: 12px;
      }

`;
