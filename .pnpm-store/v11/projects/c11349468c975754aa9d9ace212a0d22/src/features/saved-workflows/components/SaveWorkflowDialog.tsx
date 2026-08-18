import type {
  FormEvent,
} from "react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Loader2,
  Save,
  X,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import type {
  SaveWorkflowInput,
} from "../types/savedWorkflow.types";

interface SaveWorkflowDialogProps {
  open: boolean;

  title?: string;
  submitLabel?: string;

  initialName?: string;
  initialDescription?: string | null;

  roleExternalId: string;

  activityExternalIds:
    string[];

  isSaving: boolean;
  errorMessage?: string | null;
  existingWorkflowNames?: readonly string[];

  onClose: () => void;

  onSave: (
    input: SaveWorkflowInput,
  ) => void;

  onNameChange?: () => void;
}

export function SaveWorkflowDialog({
  open,
  title = "Save workflow",
  submitLabel = "Save workflow",
  initialName = "",
  initialDescription = null,
  roleExternalId,
  activityExternalIds,
  isSaving,
  errorMessage,
  existingWorkflowNames = [],
  onClose,
  onSave,
  onNameChange,
}: SaveWorkflowDialogProps) {
  const [
    name,
    setName,
  ] = useState(initialName);

  const [
    description,
    setDescription,
  ] = useState(
    initialDescription ?? "",
  );

  const [
    validationMessage,
    setValidationMessage,
  ] = useState<string | null>(
    null,
  );

  const nameInputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && errorMessage) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [errorMessage, open]);

  if (!open) {
    return null;
  }

  const handleSubmit = (
    event:
      FormEvent<HTMLFormElement>,
  ): void => {
    event.preventDefault();

    const normalizedName =
      name.trim();

    if (!normalizedName) {
      setValidationMessage(
        "Workflow name is required.",
      );

      return;
    }

    const duplicateExists =
      existingWorkflowNames.some(
        existingName =>
          existingName.trim().localeCompare(
            normalizedName,
            undefined,
            { sensitivity: "accent" },
          ) === 0,
      );

    if (duplicateExists) {
      setValidationMessage(
        `A workflow named '${normalizedName}' is already saved. Try a different name.`,
      );

      nameInputRef.current?.focus();
      nameInputRef.current?.select();

      return;
    }

    if (
      activityExternalIds.length === 0
    ) {
      setValidationMessage(
        "Select at least one activity before saving.",
      );

      return;
    }

    setValidationMessage(null);

    onSave({
      name: normalizedName,

      description:
        description.trim()
          ? description.trim()
          : null,

      roleExternalId,

      activityExternalIds,
    });
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        px-4
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-workflow-title"
    >
      <form
        className="
          w-full
          max-w-lg
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-card
          shadow-2xl
        "
        onSubmit={handleSubmit}
      >
        <header
          className="
            flex
            items-center
            justify-between
            border-b
            border-border
            px-6
            py-4
          "
        >
          <div>
            <h2
              id="save-workflow-title"
              className="
                text-lg
                font-semibold
              "
            >
              {title}
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-muted-foreground
              "
            >
              Saved workflows are stored
              in your personal workflow
              history.
            </p>
          </div>

          <button
            type="button"
            className="
              rounded-md
              p-2
              text-muted-foreground
              hover:bg-muted
              hover:text-foreground
            "
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close dialog"
          >
            <X
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>
        </header>

        <div
          className="
            space-y-5
            px-6
            py-5
          "
        >
          <label className="grid gap-2">
            <span
              className="
                text-sm
                font-medium
              "
            >
              Workflow name
            </span>

            <input
              ref={nameInputRef}
              value={name}
              maxLength={200}
              autoFocus
              className="
                h-11
                rounded-lg
                border
                border-input
                bg-background
                px-3
                text-sm
                outline-none
                focus:border-primary
                focus:ring-2
                focus:ring-primary/20
              "
              aria-invalid={
                Boolean(
                  validationMessage ||
                    errorMessage,
                )
              }
              aria-describedby={
                validationMessage ||
                errorMessage
                  ? "workflow-name-error"
                  : undefined
              }
              placeholder="Enter workflow name"
              onChange={event => {
                setName(
                  event.target.value,
                );
                setValidationMessage(null);
                onNameChange?.();
              }}
            />

            {(validationMessage ||
              errorMessage) && (
              <p
                id="workflow-name-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {validationMessage ??
                  errorMessage}
              </p>
            )}
          </label>

          <label className="grid gap-2">
            <span
              className="
                text-sm
                font-medium
              "
            >
              Description
            </span>

            <textarea
              value={description}
              maxLength={2000}
              rows={4}
              className="
                resize-none
                rounded-lg
                border
                border-input
                bg-background
                px-3
                py-2
                text-sm
                outline-none
                focus:border-primary
                focus:ring-2
                focus:ring-primary/20
              "
              placeholder="Describe this workflow"
              onChange={event =>
                setDescription(
                  event.target.value,
                )
              }
            />

            <span
              className="
                text-right
                text-[11px]
                text-muted-foreground
              "
            >
              {description.length}/2000
            </span>
          </label>

        </div>

        <footer
          className="
            flex
            justify-end
            gap-3
            border-t
            border-border
            bg-muted/20
            px-6
            py-4
          "
        >
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2
                className="
                  h-4
                  w-4
                  animate-spin
                "
                aria-hidden="true"
              />
            ) : (
              <Save
                className="h-4 w-4"
                aria-hidden="true"
              />
            )}

            {isSaving
              ? "Saving..."
              : submitLabel}
          </Button>
        </footer>
      </form>
    </div>
  );
}
