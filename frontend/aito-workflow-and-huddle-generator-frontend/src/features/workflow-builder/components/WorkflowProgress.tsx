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
  label: string; subtitle: string;
}> = [
  {
    id: "discover",
    number: 1,
    label: "Choose Your Role", subtitle: "Tell us what you do",
  },
  {
    id: "customize",
    number: 2,
    label: "Select Activities", subtitle: "Pick your priorities",
  },
  {
    id: "generate",
    number: 3,
    label: "Your Workflow", subtitle: "Build your day",
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
        bg-background
        px-4
        py-3
        backdrop-blur
      "
    >
      <ol
        className="
          mx-auto
          flex
          max-w-2xl
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
                    gap-2.5
                  "
                >
                  <span
                    className={cn(
                      `
                        flex
                    h-9
                        w-9
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

                  <span className="hidden sm:block"><span
                    className={cn(
                      `
                        text-sm
                        font-semibold
                      `,

                      isCurrent
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span><span className="block text-[11px] text-muted-foreground">{step.subtitle}</span></span>
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
