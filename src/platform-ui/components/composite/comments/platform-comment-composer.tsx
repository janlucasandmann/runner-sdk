import {
  type CSSProperties,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowUp, Bot, FileText, Paperclip, UserRound, X } from "lucide-react";

import { PlatformIconButton } from "../../ui/icon-button/index.js";
import type {
  PlatformCommentComposerProps,
  PlatformMentionOption,
  PlatformMentionReference,
  PlatformCommentReplyComposerProps,
} from "./platform-comment-types.js";
import { PlatformMentionSuggestionsPopup } from "./platform-mention-suggestions.js";

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

function getFileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
}

interface ActiveMentionQuery {
  from: number;
  to: number;
  query: string;
}

function getActiveMentionQuery(value: string, caret: number): ActiveMentionQuery | null {
  const prefix = value.slice(0, Math.max(0, caret));
  const match = prefix.match(/(^|[\s([{])@([^@\n]*)$/);
  if (!match) return null;
  const query = String(match[2] || "");
  if (query.length > 80) return null;
  return {
    from: prefix.length - query.length - 1,
    to: prefix.length,
    query,
  };
}

function filterMentionOptions(
  options: readonly PlatformMentionOption[],
  query: string,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return options
    .filter((option) => !normalizedQuery || [option.label, option.description, option.kind]
      .some((value) => String(value || "").toLocaleLowerCase().includes(normalizedQuery)));
}

function getMentionCommit(
  value: string,
  caret: number,
  options: readonly PlatformMentionOption[],
) {
  const query = getActiveMentionQuery(value, caret);
  if (!query) return null;
  const normalizedQuery = query.query.toLocaleLowerCase();
  const option = [...options]
    .sort((left, right) => right.label.length - left.label.length)
    .find((candidate) => {
      const normalizedLabel = candidate.label.trim().toLocaleLowerCase();
      if (!normalizedLabel || !normalizedQuery.startsWith(normalizedLabel)) return false;
      // A delimiter by itself is committed synchronously from keydown. This
      // path is for pasted/autofilled text and deliberately waits for actual
      // message content after the label, avoiding a controlled-input caret
      // race while someone types "@Agent message".
      return /^[\s.,!?;:]+\S/.test(query.query.slice(candidate.label.trim().length));
    });
  if (!option) return null;
  return {
    option,
    query: {
      from: query.from,
      to: query.from + option.label.trim().length + 1,
      query: option.label.trim(),
    } satisfies ActiveMentionQuery,
  };
}

function getExactMentionOption(
  query: ActiveMentionQuery | null,
  options: readonly PlatformMentionOption[],
) {
  if (!query) return null;
  const normalizedQuery = query.query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return null;
  return options.find((option) => (
    option.label.trim().toLocaleLowerCase() === normalizedQuery
  )) || null;
}

function mergeMentionReference(
  current: readonly PlatformMentionReference[],
  option: PlatformMentionOption,
) {
  return [
    ...current.filter((reference) => !(reference.kind === option.kind && reference.id === option.id)),
    { kind: option.kind, id: option.id, label: option.label },
  ];
}

function removeActiveMentionQuery(value: string, mention: ActiveMentionQuery) {
  const prefix = value.slice(0, mention.from);
  const rawSuffix = value.slice(mention.to);
  const suffix = !prefix || /\s$/.test(prefix)
    ? rawSuffix.replace(/^\s+/, "")
    : rawSuffix;
  const shouldInsertSpace = Boolean(prefix)
    && !/\s$/.test(prefix)
    && Boolean(suffix)
    && !/^\s/.test(suffix);
  const insertion = shouldInsertSpace ? " " : "";
  return {
    value: `${prefix}${insertion}${suffix}`,
    selectionStart: prefix.length + insertion.length,
  };
}

function buildMentionSubmissionBody(
  value: string,
  mentions: readonly PlatformMentionReference[],
) {
  const mentionPrefix = mentions
    .map((mention) => `@${String(mention.label || "").trim()}`)
    .filter((mention) => mention.length > 1)
    .join(" ");
  return [mentionPrefix, value.trim()].filter(Boolean).join(" ");
}

function PlatformSelectedMentions({
  mentions,
  options,
  onRemove,
  inlineRef,
}: {
  mentions: readonly PlatformMentionReference[];
  options: readonly PlatformMentionOption[];
  onRemove: (mention: PlatformMentionReference) => void;
  inlineRef: RefObject<HTMLDivElement | null>;
}) {
  if (!mentions.length) return null;
  return (
    <div
      ref={inlineRef}
      className="platform-comment-composer__selected-mentions"
      role="group"
      aria-label="Selected mentions"
    >
      {mentions.map((mention) => {
        const option = options.find((candidate) => (
          candidate.kind === mention.kind && candidate.id === mention.id
        ));
        return (
          <button
            key={`${mention.kind}:${mention.id}`}
            type="button"
            className="platform-comment-composer__selected-mention"
            aria-label={`Remove ${mention.label} mention`}
            title={`Remove ${mention.label}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onRemove(mention)}
          >
            <span className="platform-comment-composer__selected-mention-avatar" aria-hidden="true">
              {option?.avatar || (mention.kind === "agent"
                ? <Bot width={12} height={12} strokeWidth={1.8} />
                : <UserRound width={12} height={12} strokeWidth={1.8} />)}
            </span>
            <span className="platform-comment-composer__selected-mention-label">
              {mention.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function useSelectedMentionWidth(
  inlineRef: RefObject<HTMLDivElement | null>,
  mentions: readonly PlatformMentionReference[],
) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = inlineRef.current;
    if (!element || !mentions.length) {
      setWidth(0);
      return;
    }
    const measure = () => setWidth(Math.ceil(element.getBoundingClientRect().width));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [inlineRef, mentions]);
  return width;
}

export function PlatformCommentComposer({
  value,
  onChange,
  onSubmit,
  avatar,
  placeholder = "Leave a comment...",
  ariaLabel = "Comment",
  allowAttachments = false,
  attachmentAriaLabel = "Attach files",
  disabled = false,
  submitting = false,
  autoFocus = false,
  errorMessage,
  className = "",
  mentionOptions = [],
  mentionsLoading = false,
  mentionEmptyMessage,
  onMentionQueryChange,
  mentionManageLabel,
  onMentionManage,
}: PlatformCommentComposerProps) {
  const composerRef = useRef<HTMLFormElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const selectedMentionsInlineRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onMentionQueryChangeRef = useRef(onMentionQueryChange);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<ActiveMentionQuery | null>(null);
  const [mentionActiveIndex, setMentionActiveIndex] = useState(0);
  const [selectedMentions, setSelectedMentions] = useState<PlatformMentionReference[]>([]);
  const selectedMentionsInlineWidth = useSelectedMentionWidth(
    selectedMentionsInlineRef,
    selectedMentions,
  );
  const canSubmit = Boolean(value.trim()) && !disabled && !submitting;
  const filteredMentionOptions = useMemo(
    () => filterMentionOptions(mentionOptions, mentionQuery?.query || ""),
    [mentionOptions, mentionQuery?.query],
  );
  onMentionQueryChangeRef.current = onMentionQueryChange;

  useEffect(() => {
    onMentionQueryChangeRef.current?.(mentionQuery?.query ?? null);
  }, [mentionQuery?.query]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 48), 180)}px`;
  }, [value]);

  useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus({ preventScroll: true });
    }
  }, [autoFocus]);

  function appendFiles(files: FileList | readonly File[] | null) {
    if (!allowAttachments || disabled || submitting || !files) {
      return;
    }
    const incomingFiles = Array.from(files);
    if (!incomingFiles.length) {
      return;
    }
    setPendingFiles((currentFiles) => {
      const nextFiles = [...currentFiles];
      const knownFiles = new Set(currentFiles.map(getFileKey));
      incomingFiles.forEach((file) => {
        const fileKey = getFileKey(file);
        if (!knownFiles.has(fileKey)) {
          knownFiles.add(fileKey);
          nextFiles.push(file);
        }
      });
      return nextFiles;
    });
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    appendFiles(event.target.files);
    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLFormElement>) {
    if (!allowAttachments || disabled || submitting) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDraggingFiles(true);
  }

  function handleDragLeave(event: DragEvent<HTMLFormElement>) {
    const relatedTarget = event.relatedTarget;
    if (relatedTarget instanceof Node && event.currentTarget.contains(relatedTarget)) {
      return;
    }
    setIsDraggingFiles(false);
  }

  function handleDrop(event: DragEvent<HTMLFormElement>) {
    if (!allowAttachments || disabled || submitting) {
      return;
    }
    event.preventDefault();
    setIsDraggingFiles(false);
    appendFiles(event.dataTransfer.files);
  }

  async function submitComment() {
    if (!canSubmit) {
      return;
    }
    try {
      const submissionResult = selectedMentions.length > 0
        ? await onSubmit(
            pendingFiles,
            selectedMentions,
            buildMentionSubmissionBody(value, selectedMentions),
          )
        : await onSubmit(pendingFiles);
      if (submissionResult !== false) {
        setPendingFiles([]);
        setSelectedMentions([]);
        setMentionQuery(null);
      }
    } catch {
      // The consuming domain owns the visible error and may retry these files.
    }
  }

  function refreshMentionQuery(nextValue = value) {
    const textarea = textareaRef.current;
    const nextQuery = getActiveMentionQuery(nextValue, textarea?.selectionStart ?? nextValue.length);
    setMentionQuery(nextQuery);
    setMentionActiveIndex(0);
  }

  function selectMention(option: PlatformMentionOption) {
    if (!mentionQuery) return;
    commitMention(option, mentionQuery, value);
  }

  function commitMention(
    option: PlatformMentionOption,
    query: ActiveMentionQuery,
    sourceValue: string,
  ) {
    const replacement = removeActiveMentionQuery(sourceValue, query);
    onChange(replacement.value);
    setSelectedMentions((current) => mergeMentionReference(current, option));
    setMentionQuery(null);
    // React flushes the controlled value at the end of this input event. A
    // microtask restores the caret before the browser can deliver the next
    // typed character; requestAnimationFrame is too late and can rotate that
    // character to the end of the following message text.
    queueMicrotask(() => {
      textareaRef.current?.focus({ preventScroll: true });
      textareaRef.current?.setSelectionRange(
        replacement.selectionStart,
        replacement.selectionStart,
      );
    });
  }

  function removeSelectedMention(mention: PlatformMentionReference) {
    setSelectedMentions((current) => current.filter((candidate) => !(
      candidate.kind === mention.kind && candidate.id === mention.id
    )));
    requestAnimationFrame(() => textareaRef.current?.focus({ preventScroll: true }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canSubmit) {
      void submitComment();
    }
  }

  useEffect(() => {
    if (!mentionQuery || !mentionOptions.length) return;
    const commit = getMentionCommit(value, mentionQuery.to, mentionOptions);
    if (commit) commitMention(commit.option, commit.query, value);
  }, [mentionOptions, mentionQuery, value]);

  return (
    <form
      ref={composerRef}
      className={joinClassNames(
        "platform-comment-composer",
        Boolean(avatar) && "has-avatar",
        isDraggingFiles && "is-dragging-files",
        className,
      )}
      onSubmit={handleSubmit}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {avatar ? (
        <div className="platform-comment-composer__avatar" aria-hidden="true">
          {avatar}
        </div>
      ) : null}
      <div
        className={joinClassNames(
          "platform-comment-composer__input-shell",
          selectedMentions.length > 0 && "has-selected-mentions",
        )}
        style={selectedMentions.length > 0
          ? ({
              "--platform-comment-selected-mentions-width": `${selectedMentionsInlineWidth}px`,
            } as CSSProperties)
          : undefined}
      >
        <PlatformSelectedMentions
          mentions={selectedMentions}
          options={mentionOptions}
          onRemove={removeSelectedMention}
          inlineRef={selectedMentionsInlineRef}
        />
        <textarea
          ref={textareaRef}
          className="platform-comment-composer__input"
          value={value}
          rows={1}
          placeholder={selectedMentions.length ? "" : placeholder}
          aria-label={ariaLabel}
          autoFocus={autoFocus}
          disabled={disabled || submitting}
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            const nextCaret = event.currentTarget.selectionStart ?? nextValue.length;
            const commit = getMentionCommit(nextValue, nextCaret, mentionOptions);
            if (commit) {
              commitMention(commit.option, commit.query, nextValue);
              return;
            }
            onChange(nextValue);
            requestAnimationFrame(() => refreshMentionQuery(nextValue));
          }}
          onClick={() => refreshMentionQuery()}
          onKeyUp={() => refreshMentionQuery()}
          onKeyDown={(event) => {
            const liveMentionQuery = getActiveMentionQuery(
              value,
              event.currentTarget.selectionStart ?? value.length,
            );
            const exactMention = getExactMentionOption(liveMentionQuery, mentionOptions);
            if (/^[\s.,!?;:]$/.test(event.key) && exactMention && liveMentionQuery) {
              event.preventDefault();
              commitMention(exactMention, liveMentionQuery, value);
              return;
            }
            if (mentionQuery) {
              if (event.key === "Escape") {
                event.preventDefault();
                setMentionQuery(null);
                return;
              }
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                const direction = event.key === "ArrowDown" ? 1 : -1;
                setMentionActiveIndex((current) => filteredMentionOptions.length
                  ? (current + direction + filteredMentionOptions.length) % filteredMentionOptions.length
                  : 0);
                return;
              }
              if ((event.key === "Enter" || event.key === "Tab") && filteredMentionOptions[mentionActiveIndex]) {
                event.preventDefault();
                selectMention(filteredMentionOptions[mentionActiveIndex]);
                return;
              }
            }
            if (
              event.key === "Backspace"
              && value.length === 0
              && selectedMentions.length > 0
            ) {
              event.preventDefault();
              removeSelectedMention(selectedMentions[selectedMentions.length - 1]);
              return;
            }
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && canSubmit) {
              event.preventDefault();
              void submitComment();
            }
          }}
        />
      </div>
      {mentionQuery ? (
        <PlatformMentionSuggestionsPopup
          options={filteredMentionOptions}
          activeIndex={mentionActiveIndex}
          loading={mentionsLoading}
          emptyMessage={mentionEmptyMessage}
          manageLabel={mentionManageLabel}
          placement="top"
          portal
          anchorRef={composerRef}
          onActiveIndexChange={setMentionActiveIndex}
          onManage={onMentionManage}
          onSelect={selectMention}
        />
      ) : null}
      {pendingFiles.length ? (
        <div
          className="platform-comment-composer__files"
          aria-label="Files attached to this comment"
        >
          {pendingFiles.map((file) => (
            <span className="platform-comment-composer__file" key={getFileKey(file)}>
              <FileText width={13} height={13} strokeWidth={1.8} aria-hidden="true" />
              <span className="platform-comment-composer__file-name" title={file.name}>
                {file.name}
              </span>
              <button
                type="button"
                className="platform-comment-composer__file-remove"
                aria-label={`Remove ${file.name}`}
                title={`Remove ${file.name}`}
                disabled={disabled || submitting}
                onClick={() => {
                  setPendingFiles((currentFiles) =>
                    currentFiles.filter((candidate) => candidate !== file),
                  );
                }}
              >
                <X width={11} height={11} strokeWidth={1.9} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <div className="platform-comment-composer__actions">
        {allowAttachments ? (
          <>
            <input
              ref={fileInputRef}
              className="platform-comment-composer__file-input"
              type="file"
              multiple
              tabIndex={-1}
              onChange={handleFileInputChange}
            />
            <PlatformIconButton
              type="button"
              size="small"
              className="platform-comment-composer__attach"
              aria-label={attachmentAriaLabel}
              title={attachmentAriaLabel}
              disabled={disabled || submitting}
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
            </PlatformIconButton>
          </>
        ) : null}
        <PlatformIconButton
          type="submit"
          size="small"
          className="platform-comment-composer__submit"
          aria-label={submitting ? "Adding comment" : "Add comment"}
          title={submitting ? "Adding comment" : "Add comment"}
          disabled={!canSubmit}
        >
          <ArrowUp width={14} height={14} strokeWidth={1.9} aria-hidden="true" />
        </PlatformIconButton>
      </div>
      {errorMessage ? (
        <div className="platform-comment-composer__error" role="alert">
          {errorMessage}
        </div>
      ) : null}
    </form>
  );
}

export function PlatformCommentReplyComposer({
  onSubmit,
  avatar,
  placeholder = "Leave a reply...",
  ariaLabel = "Reply",
  disabled = false,
  autoFocus = false,
  mentionOptions = [],
  mentionsLoading = false,
  mentionEmptyMessage,
  onMentionQueryChange,
  mentionManageLabel,
  onMentionManage,
}: PlatformCommentReplyComposerProps) {
  const composerRef = useRef<HTMLFormElement | null>(null);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mentionQuery, setMentionQuery] = useState<ActiveMentionQuery | null>(null);
  const [mentionActiveIndex, setMentionActiveIndex] = useState(0);
  const [selectedMentions, setSelectedMentions] = useState<PlatformMentionReference[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const selectedMentionsInlineRef = useRef<HTMLDivElement | null>(null);
  const onMentionQueryChangeRef = useRef(onMentionQueryChange);
  const canSubmit = Boolean(value.trim()) && !disabled && !submitting;
  const selectedMentionsInlineWidth = useSelectedMentionWidth(
    selectedMentionsInlineRef,
    selectedMentions,
  );
  const filteredMentionOptions = useMemo(
    () => filterMentionOptions(mentionOptions, mentionQuery?.query || ""),
    [mentionOptions, mentionQuery?.query],
  );
  onMentionQueryChangeRef.current = onMentionQueryChange;

  useEffect(() => {
    onMentionQueryChangeRef.current?.(mentionQuery?.query ?? null);
  }, [mentionQuery?.query]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 24), 96)}px`;
  }, [value]);

  useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus({ preventScroll: true });
    }
  }, [autoFocus]);

  async function submitReply() {
    if (!canSubmit) {
      return;
    }
    setSubmitting(true);
    setErrorMessage("");
    try {
      if (selectedMentions.length > 0) {
        await onSubmit(buildMentionSubmissionBody(value, selectedMentions), selectedMentions);
      } else {
        await onSubmit(value.trim());
      }
      setValue("");
      setSelectedMentions([]);
      setMentionQuery(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to add reply.");
    } finally {
      setSubmitting(false);
    }
  }

  function refreshReplyMentionQuery(nextValue = value) {
    const textarea = textareaRef.current;
    setMentionQuery(getActiveMentionQuery(nextValue, textarea?.selectionStart ?? nextValue.length));
    setMentionActiveIndex(0);
  }

  function selectReplyMention(option: PlatformMentionOption) {
    if (!mentionQuery) return;
    commitReplyMention(option, mentionQuery, value);
  }

  function commitReplyMention(
    option: PlatformMentionOption,
    query: ActiveMentionQuery,
    sourceValue: string,
  ) {
    const replacement = removeActiveMentionQuery(sourceValue, query);
    setValue(replacement.value);
    setSelectedMentions((current) => mergeMentionReference(current, option));
    setMentionQuery(null);
    queueMicrotask(() => {
      textareaRef.current?.focus({ preventScroll: true });
      textareaRef.current?.setSelectionRange(
        replacement.selectionStart,
        replacement.selectionStart,
      );
    });
  }

  function removeSelectedReplyMention(mention: PlatformMentionReference) {
    setSelectedMentions((current) => current.filter((candidate) => !(
      candidate.kind === mention.kind && candidate.id === mention.id
    )));
    requestAnimationFrame(() => textareaRef.current?.focus({ preventScroll: true }));
  }

  useEffect(() => {
    if (!mentionQuery || !mentionOptions.length) return;
    const commit = getMentionCommit(value, mentionQuery.to, mentionOptions);
    if (commit) commitReplyMention(commit.option, commit.query, value);
  }, [mentionOptions, mentionQuery, value]);

  return (
    <form
      ref={composerRef}
      className="platform-comment-reply-composer"
      onSubmit={(event) => {
        event.preventDefault();
        void submitReply();
      }}
    >
      {avatar ? (
        <div className="platform-comment-reply-composer__avatar" aria-hidden="true">
          {avatar}
        </div>
      ) : null}
      <div
        className={joinClassNames(
          "platform-comment-reply-composer__input-shell",
          selectedMentions.length > 0 && "has-selected-mentions",
        )}
        style={selectedMentions.length > 0
          ? ({
              "--platform-comment-selected-mentions-width": `${selectedMentionsInlineWidth}px`,
            } as CSSProperties)
          : undefined}
      >
        <PlatformSelectedMentions
          mentions={selectedMentions}
          options={mentionOptions}
          onRemove={removeSelectedReplyMention}
          inlineRef={selectedMentionsInlineRef}
        />
        <textarea
          ref={textareaRef}
          className="platform-comment-reply-composer__input"
          value={value}
          rows={1}
          placeholder={selectedMentions.length ? "" : placeholder}
          aria-label={ariaLabel}
          autoFocus={autoFocus}
          disabled={disabled || submitting}
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            const nextCaret = event.currentTarget.selectionStart ?? nextValue.length;
            const commit = getMentionCommit(nextValue, nextCaret, mentionOptions);
            if (commit) {
              commitReplyMention(commit.option, commit.query, nextValue);
              return;
            }
            setValue(nextValue);
            requestAnimationFrame(() => refreshReplyMentionQuery(nextValue));
            if (errorMessage) {
              setErrorMessage("");
            }
          }}
          onClick={() => refreshReplyMentionQuery()}
          onKeyUp={() => refreshReplyMentionQuery()}
          onKeyDown={(event) => {
            const liveMentionQuery = getActiveMentionQuery(
              value,
              event.currentTarget.selectionStart ?? value.length,
            );
            const exactMention = getExactMentionOption(liveMentionQuery, mentionOptions);
            if (/^[\s.,!?;:]$/.test(event.key) && exactMention && liveMentionQuery) {
              event.preventDefault();
              commitReplyMention(exactMention, liveMentionQuery, value);
              return;
            }
            if (mentionQuery) {
              if (event.key === "Escape") {
                event.preventDefault();
                setMentionQuery(null);
                return;
              }
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                const direction = event.key === "ArrowDown" ? 1 : -1;
                setMentionActiveIndex((current) => filteredMentionOptions.length
                  ? (current + direction + filteredMentionOptions.length) % filteredMentionOptions.length
                  : 0);
                return;
              }
              if ((event.key === "Enter" || event.key === "Tab") && filteredMentionOptions[mentionActiveIndex]) {
                event.preventDefault();
                selectReplyMention(filteredMentionOptions[mentionActiveIndex]);
                return;
              }
            }
            if (
              event.key === "Backspace"
              && value.length === 0
              && selectedMentions.length > 0
            ) {
              event.preventDefault();
              removeSelectedReplyMention(selectedMentions[selectedMentions.length - 1]);
              return;
            }
            if (
              event.key === "Enter"
              && !event.shiftKey
              && !event.nativeEvent.isComposing
              && canSubmit
            ) {
              event.preventDefault();
              void submitReply();
            }
          }}
        />
      </div>
      {mentionQuery ? (
        <PlatformMentionSuggestionsPopup
          options={filteredMentionOptions}
          activeIndex={mentionActiveIndex}
          loading={mentionsLoading}
          emptyMessage={mentionEmptyMessage}
          manageLabel={mentionManageLabel}
          placement="top"
          portal
          anchorRef={composerRef}
          onActiveIndexChange={setMentionActiveIndex}
          onManage={onMentionManage}
          onSelect={selectReplyMention}
        />
      ) : null}
      <PlatformIconButton
        type="submit"
        size="small"
        className="platform-comment-reply-composer__submit"
        aria-label={submitting ? "Adding reply" : "Add reply"}
        title={submitting ? "Adding reply" : "Add reply"}
        disabled={!canSubmit}
      >
        <ArrowUp width={14} height={14} strokeWidth={1.9} aria-hidden="true" />
      </PlatformIconButton>
      {errorMessage ? (
        <div className="platform-comment-reply-composer__error" role="alert">
          {errorMessage}
        </div>
      ) : null}
    </form>
  );
}
