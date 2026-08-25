import {
  Loader2,
  Trash2,
  X,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

interface DeleteWorkflowDialogProps {
  open: boolean;
  workflowName: string;
  isDeleting: boolean;
  errorMessage?: string | null;

  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteWorkflowDialog({
  open,
  workflowName,
  isDeleting,
  errorMessage,
  onClose,
  onConfirm,
}: DeleteWorkflowDialogProps) {
  if (!open) {
    return null;
  }

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
    >
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-border
          bg-card
          shadow-2xl
        "
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
          <h2
            className="
              text-lg
              font-semibold
            "
          >
            Delete workflow
          </h2>

          <button
            type="button"
            className="
              rounded-md
              p-2
              text-muted-foreground
              hover:bg-muted
            "
            disabled={isDeleting}
            onClick={onClose}
          >
            <X
              className="h-4 w-4"
            />
          </button>
        </header>

        <div className="px-6 py-5">
          <p
            className="
              text-sm
              leading-6
              text-muted-foreground
            "
          >
            Are you sure you want to
            delete{" "}
            <strong className="text-foreground">
              {workflowName}
            </strong>
            ? This action cannot be
            undone.
          </p>

          {errorMessage && (
            <p
              className="
                mt-4
                rounded-lg
                border
                border-destructive/30
                bg-destructive/10
                px-3
                py-2
                text-sm
                text-destructive
              "
            >
              {errorMessage}
            </p>
          )}
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
            disabled={isDeleting}
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            className="gap-2"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? (
              <Loader2
                className="
                  h-4
                  w-4
                  animate-spin
                "
              />
            ) : (
              <Trash2
                className="h-4 w-4"
              />
            )}

            {isDeleting
              ? "Deleting..."
              : "Delete"}
          </Button>
        </footer>
      </div>
    </div>
  );
}