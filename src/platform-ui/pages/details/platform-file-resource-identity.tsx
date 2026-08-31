import type { ReactNode, Ref } from "react";

export interface PlatformFileResourceIdentityProps {
  icon: ReactNode;
  title: string;
  description: string;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
  onTitleBlur?: (title: string) => void;
  onDescriptionBlur?: (description: string) => void;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
  titleAriaLabel?: string;
  descriptionAriaLabel?: string;
  titleRef?: Ref<HTMLInputElement>;
  readOnly?: boolean;
  ariaLabel?: string;
  className?: string;
  iconClassName?: string;
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

/** Shared editable identity header for source-oriented resource detail tabs. */
export function PlatformFileResourceIdentity({
  icon,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onTitleBlur,
  onDescriptionBlur,
  titlePlaceholder,
  descriptionPlaceholder = "Describe this resource",
  titleAriaLabel = "Resource name",
  descriptionAriaLabel = "Resource description",
  titleRef,
  readOnly = false,
  ariaLabel = "Resource identity",
  className = "",
  iconClassName = "",
}: PlatformFileResourceIdentityProps) {
  const titleReadOnly = readOnly || !onTitleChange;
  const descriptionReadOnly = readOnly || !onDescriptionChange;

  return (
    <section
      className={joinClassNames("file-resource-identity", className)}
      aria-label={ariaLabel}
      data-platform-file-resource-identity="true"
    >
      <div
        className={joinClassNames("file-resource-identity__icon", iconClassName)}
      >
        {icon}
      </div>
      <div className="file-resource-identity__copy">
        <input
          ref={titleRef}
          type="text"
          className="file-resource-identity__title-input"
          value={title}
          onChange={(event) => onTitleChange?.(event.currentTarget.value)}
          onBlur={(event) => onTitleBlur?.(event.currentTarget.value)}
          placeholder={titlePlaceholder}
          readOnly={titleReadOnly}
          aria-label={titleAriaLabel}
        />
        <input
          type="text"
          className="file-resource-detail-page__description-input file-resource-identity__description-input"
          value={description}
          onChange={(event) => onDescriptionChange?.(event.currentTarget.value)}
          onBlur={(event) => onDescriptionBlur?.(event.currentTarget.value)}
          placeholder={descriptionPlaceholder}
          readOnly={descriptionReadOnly}
          aria-label={descriptionAriaLabel}
        />
      </div>
    </section>
  );
}
