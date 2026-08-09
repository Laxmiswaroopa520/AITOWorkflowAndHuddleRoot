import {
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  motion,
} from "motion/react";

import {
  Button,
} from "@/components/ui/button";

import {
  ErrorState,
} from "@/components/feedback/ErrorState";

import type {
  Role,
} from "../types/role.types";

import {
  RoleCard,
} from "./RoleCard";

import {
  SegmentTabs,
} from "./SegmentTabs";

import discoverHeroGraphic from
  "@/assets/workflow/discover-hero-graphic.png";

interface RoleSelectorProps {
  roles: Role[];
  isLoading: boolean;
  error: Error | null;
  selectedRoleId: string | null;
  selectedSegment: string;
  onSelectRole: (
    roleId: string,
  ) => void;
  onSelectSegment: (
    segment: string,
  ) => void;
  onContinue: () => void;
  onRetry: () => void;
}

export function RoleSelector({
  roles,
  isLoading,
  error,
  selectedRoleId,
  selectedSegment,
  onSelectRole,
  onSelectSegment,
  onContinue,
  onRetry,
}: RoleSelectorProps) {
  const [
    validationMessage,
    setValidationMessage,
  ] = useState<string | null>(
    null,
  );

  const segments =
    useMemo(
      () =>
        Array.from(
          new Set(
            roles
              .map(
                role =>
                  role.segment,
              )
              .filter(
                (
                  segment,
                ): segment is string =>
                  Boolean(segment),
              ),
          ),
        ),
      [roles],
    );

  const visibleRoles =
    useMemo(() => {
      if (
        selectedSegment === "All"
      ) {
        return roles;
      }

      return roles.filter(
        role =>
          role.segment ===
          selectedSegment,
      );
    }, [
      roles,
      selectedSegment,
    ]);

  const handleContinue =
    (): void => {
      if (!selectedRoleId) {
        setValidationMessage(
          "Select a role before continuing.",
        );

        return;
      }

      setValidationMessage(null);
      onContinue();
    };

  if (isLoading) {
    return (
      <div
        className="
          flex
          min-h-[65vh]
          items-center
          justify-center
        "
      >
        <div className="text-center">
          <Loader2
            className="
              mx-auto
              h-8
              w-8
              animate-spin
              text-primary
            "
          />

          <p
            className="
              mt-3
              text-sm
              text-muted-foreground
            "
          >
            Loading roles...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Roles could not be loaded"
        message={error.message}
        onRetry={onRetry}
      />
    );
  }

  return (
    <section
      className="
        mx-auto
        w-full
        max-w-7xl
        px-4
        pb-10
        pt-6
      "
    >
      <div
        className="
          grid
          items-center
          gap-10
          lg:grid-cols-[1.1fr_0.9fr]
        "
      >
        <motion.div
          initial={{
            opacity: 0,
            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-primary/20
              bg-primary/10
              px-3
              py-1.5
              text-xs
              font-semibold
              text-primary
            "
          >
            <Sparkles
              className="h-3.5 w-3.5"
            />

            Discover your workflow
          </div>

          <h1
            className="
              mt-5
              max-w-3xl
              text-3xl
              font-bold
              tracking-tight
              text-foreground
              sm:text-4xl
              lg:text-5xl
            "
          >
            Build a workflow tailored
            to your role
          </h1>

          <p
            className="
              mt-4
              max-w-2xl
              text-base
              leading-7
              text-muted-foreground
              sm:text-lg
            "
          >
            Select your role and we
            will recommend the most
            relevant activities and AI
            tools for your day.
          </p>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="
            flex
            justify-center
            lg:justify-end
          "
        >
          <img
            src={discoverHeroGraphic}
            alt=""
            className="
              w-full
              max-w-[430px]
              object-contain
            "
          />
        </motion.div>
      </div>

      <div className="mt-10">
        <SegmentTabs
          segments={segments}
          selectedSegment={
            selectedSegment
          }
          onSelect={
            onSelectSegment
          }
        />
      </div>

      {visibleRoles.length > 0 ? (
        <motion.div
          layout
          className="
            mt-8
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >
          {visibleRoles.map(role => (
            <RoleCard
              key={role.externalId}
              role={role}
              isSelected={
                selectedRoleId ===
                role.externalId
              }
              onSelect={
                onSelectRole
              }
            />
          ))}
        </motion.div>
      ) : (
        <div
          className="
            mt-10
            rounded-2xl
            border
            border-dashed
            border-border
            bg-muted/30
            px-6
            py-12
            text-center
          "
        >
          <p className="font-medium">
            No roles are available for
            this segment.
          </p>
        </div>
      )}

      {validationMessage && (
        <p
          role="alert"
          className="
            mt-5
            text-center
            text-sm
            font-medium
            text-destructive
          "
        >
          {validationMessage}
        </p>
      )}

      <div
        className="
          mt-8
          flex
          justify-center
        "
      >
        <Button
          type="button"
          size="lg"
          className="
            min-w-[210px]
            gap-2
            rounded-xl
          "
          onClick={
            handleContinue
          }
        >
          Continue

          <ArrowRight
            className="h-4 w-4"
          />
        </Button>
      </div>
    </section>
  );
}