import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
  projectNameDisabled?: boolean;
  summaryDisabled?: boolean;
  onIdentityChange: (
    value: ProjectIconPickerValue,
  ) => boolean | undefined | Promise<boolean | undefined>;
  onProjectNameChange?: (value: string) => void;
  onProjectNameCommit?: (value: string) => void | Promise<unknown>;
  onProjectNameEditingChange?: (editing: boolean) => void;
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
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export function ProjectSummary({
  projectName,
  summary,
  icon,
  color,
  iconOptions,
  colorOptions,
  identityDisabled = false,
  projectNameDisabled = false,
  summaryDisabled = false,
  onIdentityChange,
  onProjectNameChange,
  onProjectNameCommit,
  onProjectNameEditingChange,
  onSummaryChange,
  onSummaryCommit,
  onSummaryEditingChange,
  className = "",
}: ProjectSummaryProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const nameEditingRef = useRef(false);
  const latestNameRef = useRef(projectName);
  const latestSummaryRef = useRef(summary);
  const [nameDraft, setNameDraft] = useState(projectName);

  useLayoutEffect(() => {
    if (!nameEditingRef.current) {
      latestNameRef.current = projectName;
      setNameDraft(projectName);
    }
  }, [projectName]);

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

  const handleNameFocus = () => {
    nameEditingRef.current = true;
    onProjectNameEditingChange?.(true);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextName = event.currentTarget.value;
    latestNameRef.current = nextName;
    setNameDraft(nextName);
    onProjectNameChange?.(nextName);
  };

  const commitName = () => {
    nameEditingRef.current = false;
    onProjectNameEditingChange?.(false);
    const nextName = latestNameRef.current.trim();
    if (!nextName) {
      setNameDraft(projectName);
      return;
    }
    void onProjectNameCommit?.(nextName);
  };

  const handleNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    } else if (event.key === "Escape") {
      event.preventDefault();
      latestNameRef.current = projectName;
      setNameDraft(projectName);
      event.currentTarget.blur();
    }
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
      <div className="platform-project-summary__copy">
        <input
          className="platform-project-summary__title"
          type="text"
          value={nameDraft}
          maxLength={160}
          aria-label="Project name"
          disabled={projectNameDisabled}
          onFocus={handleNameFocus}
          onChange={handleNameChange}
          onBlur={commitName}
          onKeyDown={handleNameKeyDown}
        />
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
      </div>
    </section>
  );
}
