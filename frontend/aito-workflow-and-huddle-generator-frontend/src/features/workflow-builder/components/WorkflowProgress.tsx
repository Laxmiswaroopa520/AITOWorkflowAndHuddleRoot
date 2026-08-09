import {
  Check,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils";

import type {
  WorkflowStep,
} from "../types/workflowBuilder.types";

interface WorkflowProgressProps {
  currentStep: WorkflowStep;
}

const workflowSteps: Array<{
  id: WorkflowStep;
  number: number;
  label: string;
}> = [
  {
    id: "discover",
    number: 1,
    label: "Discover",
  },
  {
    id: "customize",
    number: 2,
    label: "Customize",
  },
  {
    id: "generate",
    number: 3,
    label: "Generate",
  },
];

export function WorkflowProgress({
  currentStep,
}: WorkflowProgressProps) {
  const currentIndex =
    workflowSteps.findIndex(
      step =>
        step.id === currentStep,
    );

  return (
    <nav
      aria-label="Workflow progress"
      className="
        border-b
        border-border
        bg-card/80
        px-4
        py-4
        backdrop-blur
      "
    >
      <ol
        className="
          mx-auto
          flex
          max-w-3xl
          items-center
          justify-center
        "
      >
        {workflowSteps.map(
          (step, index) => {
            const isComplete =
              index < currentIndex;

            const isCurrent =
              index === currentIndex;

            return (
              <li
                key={step.id}
                className="
                  flex
                  flex-1
                  items-center
                  last:flex-none
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <span
                    className={cn(
                      `
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        border
                        text-xs
                        font-semibold
                      `,

                      isComplete &&
                        `
                          border-primary
                          bg-primary
                          text-primary-foreground
                        `,

                      isCurrent &&
                        `
                          border-primary
                          bg-primary/10
                          text-primary
                        `,

                      !isComplete &&
                        !isCurrent &&
                        `
                          border-border
                          bg-background
                          text-muted-foreground
                        `,
                    )}
                  >
                    {isComplete ? (
                      <Check
                        className="h-4 w-4"
                      />
                    ) : (
                      step.number
                    )}
                  </span>

                  <span
                    className={cn(
                      `
                        hidden
                        text-sm
                        font-medium
                        sm:block
                      `,

                      isCurrent
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {index <
                  workflowSteps.length -
                    1 && (
                  <span
                    className={cn(
                      `
                        mx-3
                        h-px
                        flex-1
                      `,
                      index <
                        currentIndex
                        ? "bg-primary"
                        : "bg-border",
                    )}
                  />
                )}
              </li>
            );
          },
        )}
      </ol>
    </nav>
  );
}