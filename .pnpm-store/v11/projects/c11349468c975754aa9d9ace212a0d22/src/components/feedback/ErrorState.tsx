import {
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title,
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="
        flex
        min-h-[50vh]
        items-center
        justify-center
        px-4
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-destructive/20
          bg-card
          p-6
          text-center
          shadow-sm
        "
        role="alert"
      >
        <div
          className="
            mx-auto
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            bg-destructive/10
            text-destructive
          "
        >
          <AlertTriangle
            className="h-6 w-6"
            aria-hidden="true"
          />
        </div>

        <h2
          className="
            mt-4
            text-lg
            font-semibold
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          {message}
        </p>

        {onRetry && (
          <Button
            type="button"
            variant="outline"
            className="mt-5 gap-2"
            onClick={onRetry}
          >
            <RotateCcw
              className="h-4 w-4"
              aria-hidden="true"
            />

            Try again
          </Button>
        )}
      </div>
    </div>
  );
}