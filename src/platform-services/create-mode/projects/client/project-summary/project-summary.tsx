import { type ChangeEvent, type FocusEvent, useLayoutEffect, useRef } from "react";
import {
  ProjectIconPicker,
  type ProjectIconPickerOption,
  type ProjectIconPickerValue,
} from "../project-icon-picker/index.js";

export interface ProjectSummaryProps {
  projectName: string;
  summary: string;
  icon: string;
  color: string;
  iconOptions: readonly ProjectIconPickerOption[];
  colorOptions: readonly string[];
  identityDisabled?: boolean;
  summaryDisabled?: boolean;
  onIdentityChange: (
    value: ProjectIconPickerValue,
  ) => boolean | undefined | Promise<boolean | undefined>;
  onSummaryChange: (value: string) => void;
  onSummaryCommit?: (value: string) => void | Promise<void>;
  onSummaryEditingChange?: (editing: boolean) => void;
  className?: string;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

function resizeSummaryTextarea(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 72)}px`;
}

export function ProjectSummary({
  projectName,
  summary,
  icon,
  color,
  iconOptions,
  colorOptions,
  identityDisabled = false,
  summaryDisabled = false,
  onIdentityChange,
  onSummaryChange,
  onSummaryCommit,
  onSummaryEditingChange,
  className = "",
}: ProjectSummaryProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const latestSummaryRef = useRef(summary);

  useLayoutEffect(() => {
    latestSummaryRef.current = summary;
    resizeSummaryTextarea(textareaRef.current);
  }, [summary]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    resizeSummaryTextarea(event.currentTarget);
    latestSummaryRef.current = event.currentTarget.value;
    onSummaryChange(latestSummaryRef.current);
  };

  const handleBlur = (_event: FocusEvent<HTMLTextAreaElement>) => {
    onSummaryEditingChange?.(false);
    void onSummaryCommit?.(latestSummaryRef.current);
  };

  return (
    <section
      className={joinClassNames("platform-project-summary", className)}
      aria-label={`${projectName} summary`}
    >
      <ProjectIconPicker
        projectName={projectName}
        icon={icon}
        color={color}
        iconOptions={iconOptions}
        colorOptions={colorOptions}
        showProjectName={false}
        disabled={identityDisabled}
        onChange={onIdentityChange}
        className="platform-project-summary__icon-picker"
      />
      <h1 className="platform-project-summary__title">{projectName}</h1>
      <textarea
        ref={textareaRef}
        className="platform-project-summary__input"
        value={summary}
        rows={1}
        maxLength={320}
        placeholder="Add a short summary..."
        aria-label="Project summary"
        disabled={summaryDisabled}
        onFocus={() => onSummaryEditingChange?.(true)}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </section>
  );
}
