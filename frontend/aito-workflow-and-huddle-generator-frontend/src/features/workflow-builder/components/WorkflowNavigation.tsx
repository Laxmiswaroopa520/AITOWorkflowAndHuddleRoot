import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

interface WorkflowNavigationProps {
  backLabel?: string;
  nextLabel?: string;

  showBack?: boolean;
  showNext?: boolean;
  showRestart?: boolean;

  nextDisabled?: boolean;

  onBack?: () => void;
  onNext?: () => void;
  onRestart?: () => void;
}

export function WorkflowNavigation({
  backLabel = "Back",
  nextLabel = "Continue",
  showBack = true,
  showNext = true,
  showRestart = false,
  nextDisabled = false,
  onBack,
  onNext,
  onRestart,
}: WorkflowNavigationProps) {
  return (
    <div
      className="
        flex
        flex-wrap
        items-center
        justify-between
        gap-3
      "
    >
      <div>
        {showBack && onBack && (
          <Button
            type="button"
            variant="ghost"
            className="gap-2"
            onClick={onBack}
          >
            <ArrowLeft
              className="h-4 w-4"
              aria-hidden="true"
            />

            {backLabel}
          </Button>
        )}
      </div>

      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        {showRestart &&
          onRestart && (
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={onRestart}
            >
              <RotateCcw
                className="h-4 w-4"
                aria-hidden="true"
              />

              Start again
            </Button>
          )}

        {showNext && onNext && (
          <Button
            type="button"
            className="gap-2"
            disabled={nextDisabled}
            onClick={onNext}
          >
            {nextLabel}

            <ArrowRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Button>
        )}
      </div>
    </div>
  );
}