import {
  Check,
} from "lucide-react";

import {
  motion,
} from "motion/react";

import {
  cn,
} from "@/lib/utils";

import type {
  Role,
} from "../types/role.types";

import {
  SEGMENT_STYLES,
} from "../constants/workflowStyles";

interface RoleCardProps {
  role: Role;
  isSelected: boolean;
  onSelect: (
    roleId: string,
  ) => void;
}

export function RoleCard({
  role,
  isSelected,
  onSelect,
}: RoleCardProps) {
  const segment =
    role.segment ??
    "Enterprise";

  const style =
    SEGMENT_STYLES[segment] ??
    SEGMENT_STYLES.Enterprise;

  const SegmentIcon =
    style.icon;

  return (
    <motion.button
      type="button"
      whileHover={{
        y: -4,
      }}
      whileTap={{
        scale: 0.99,
      }}
      onClick={() =>
        onSelect(role.externalId)
      }
      className={cn(
        `
          group
          relative
          flex
          min-h-[190px]
          w-full
          flex-col
          rounded-2xl
          border
          bg-card
          p-5
          text-left
          transition-all
          duration-200
        `,

        isSelected
          ? cn(
              style.cardBorder,
              style.cardBg,
              style.cardShadow,
              "border-2",
            )
          : `
              border-border
              hover:border-primary/30
              hover:shadow-lg
            `,
      )}
    >
      {isSelected && (
        <span
          className={cn(
            `
              absolute
              right-4
              top-4
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-full
              text-white
            `,
            style.badgeBg,
          )}
        >
          <Check
            className="h-4 w-4"
          />
        </span>
      )}

      <div
        className={cn(
          `
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
          `,
          style.iconBg,
          style.iconText,
        )}
      >
        <SegmentIcon
          className="h-5 w-5"
        />
      </div>

      <div className="mt-5">
        <p
          className="
            text-xs
            font-semibold
            uppercase
            tracking-[0.12em]
            text-muted-foreground
          "
        >
          {role.abbreviation}
        </p>

        <h3
          className="
            mt-1
            text-base
            font-semibold
            text-foreground
          "
        >
          {role.name}
        </h3>

        {role.description && (
          <p
            className="
              mt-2
              line-clamp-3
              text-sm
              leading-relaxed
              text-muted-foreground
            "
          >
            {role.description}
          </p>
        )}
      </div>

      <span
        className={cn(
          `
            mt-auto
            inline-flex
            w-fit
            rounded-full
            px-2.5
            py-1
            text-[11px]
            font-medium
            text-white
          `,
          style.badgeBg,
        )}
      >
        {segment}
      </span>
    </motion.button>
  );
}