import {
  Star,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils";

interface FavoriteButtonProps {
  isFavorite: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export function FavoriteButton({
  isFavorite,
  disabled = false,
  onToggle,
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={
        isFavorite
          ? "Remove from favorites"
          : "Add to favorites"
      }
      className={cn(
        `
          rounded-lg
          border
          border-border
          p-2
          transition
          disabled:cursor-not-allowed
          disabled:opacity-50
        `,

        isFavorite
          ? `
              border-amber-300
              bg-amber-50
              text-amber-600
            `
          : `
              bg-background
              text-muted-foreground
              hover:text-amber-500
            `,
      )}
      onClick={onToggle}
    >
      <Star
        className="h-4 w-4"
        fill={
          isFavorite
            ? "currentColor"
            : "none"
        }
      />
    </button>
  );
}