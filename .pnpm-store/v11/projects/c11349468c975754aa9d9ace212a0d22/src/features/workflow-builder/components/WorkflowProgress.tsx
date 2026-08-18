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
  canOpenActivities: boolean;
  canOpenWorkflow: boolean;
  onStepChange: (
    step: WorkflowStep,
  ) => void;
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
  canOpenActivities,
  canOpenWorkflow,
  onStepChange,
}: WorkflowProgressProps) {
  const currentIndex =
    workflowSteps.findIndex(
      step =>
        step.id === currentStep,
    );

  return (
    <nav
      data-tour="workflow-progress"
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

            const isEnabled =
              step.id === "discover" ||
              (step.id === "customize" &&
                canOpenActivities) ||
              (step.id === "generate" &&
                canOpenWorkflow);

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
                <button
                  type="button"
                  onClick={() =>
                    onStepChange(step.id)
                  }
                  disabled={!isEnabled}
                  aria-current={
                    isCurrent
                      ? "step"
                      : undefined
                  }
                  className={cn(
                    `
                    flex
                    items-center
                    gap-2.5
                    rounded-lg
                    text-left
                    transition
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-primary/50
                    focus-visible:ring-offset-2
                  `,
                    isEnabled &&
                      !isCurrent &&
                      `
                        cursor-pointer
                        group
                      `,
                    !isEnabled &&
                      `
                        cursor-not-allowed
                        opacity-50
                      `,
                  )}
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

                      isEnabled &&
                        !isCurrent &&
                        `
                          transition
                          group-hover:border-primary
                          group-hover:ring-2
                          group-hover:ring-primary/20
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

                      isEnabled &&
                        !isCurrent &&
                        "group-hover:text-primary",
                    )}
                  >
                    {step.label}
                  </span><span className="block text-[11px] text-muted-foreground">{step.subtitle}</span></span>
                </button>

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
