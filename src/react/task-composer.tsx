import { FormEvent, useState } from "react";

export interface TaskComposerSubmitPayload {
  task: string;
}

export interface TaskComposerProps {
  onSubmit: (payload: TaskComposerSubmitPayload) => Promise<void> | void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  submitLabel?: string;
  minRows?: number;
}

export function TaskComposer({
  onSubmit,
  disabled = false,
  className,
  placeholder = "Describe the task...",
  submitLabel = "Run",
  minRows = 4,
}: TaskComposerProps) {
  const [task, setTask] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTask = task.trim();
    if (!trimmedTask || disabled || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ task: trimmedTask });
      setTask("");
    } finally {
      setIsSubmitting(false);
    }
  }

  const submitDisabled = disabled || isSubmitting || !task.trim();
  return (
    <form onSubmit={handleSubmit} className={className}>
      <textarea
        value={task}
        onChange={(event) => setTask(event.target.value)}
        placeholder={placeholder}
        rows={minRows}
        disabled={disabled || isSubmitting}
      />
      <button type="submit" disabled={submitDisabled}>
        {isSubmitting ? "Running..." : submitLabel}
      </button>
    </form>
  );
}

