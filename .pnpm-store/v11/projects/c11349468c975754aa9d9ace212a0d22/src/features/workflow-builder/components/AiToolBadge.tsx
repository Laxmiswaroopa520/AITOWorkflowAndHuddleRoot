import {
  cn,
} from "@/lib/utils";

interface AiToolBadgeProps {
  name: string;
  color: string | null;
  isPrimary?: boolean;
}

export function AiToolBadge({
  name,
  color,
  isPrimary = false,
}: AiToolBadgeProps) {
  return (
    <span
      className={cn(
        `
          inline-flex
          items-center
          gap-1.5
          rounded-full
          border
          border-border
          bg-background
          px-2
          py-0.5
          text-[10px]
          font-medium
          text-foreground
        `,

        isPrimary &&
          `
            border-primary/30
            bg-primary/5
          `,
      )}
    >
      <span
        className="
          h-2
          w-2
          rounded-full
        "
        style={{
          backgroundColor:
            color ?? "#64748b",
        }}
      />

      {name}
    </span>
  );
}