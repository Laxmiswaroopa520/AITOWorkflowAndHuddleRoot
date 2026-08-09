//just for testing purpose

import {
  ErrorState,
} from "@/components/feedback/ErrorState";

import {
  LoadingSpinner,
} from "@/components/feedback/LoadingSpinner";

import {
  useWorkflowData,
} from "../hooks/useWorkflowData";

export function ReferenceDataDiagnosticPage() {
  const workflowData =
    useWorkflowData();

  if (workflowData.isLoading) {
    return (
      <LoadingSpinner
        message={
          "Loading workflow reference data..."
        }
      />
    );
  }

  if (workflowData.isError) {
    return (
      <ErrorState
        title="Reference data could not be loaded"
        message={
          workflowData.error?.message ??
          "An unknown error occurred."
        }
        onRetry={() => {
          void workflowData.refetchAll();
        }}
      />
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Reference Data Diagnostics
        </h1>

        <p className="text-muted-foreground">
          This temporary page verifies SQL-backed
          reference-data APIs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CountCard
          label="Roles"
          value={workflowData.roles.length}
        />

        <CountCard
          label="AI Tools"
          value={workflowData.aiTools.length}
        />

        <CountCard
          label="Workflow Buckets"
          value={
            workflowData
              .workflowBuckets
              .length
          }
        />

        <CountCard
          label="Activities"
          value={
            workflowData.activities.length
          }
        />
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold">
          Roles
        </h2>

        <ul className="mt-3 space-y-2">
          {workflowData.roles.map(role => (
            <li key={role.externalId}>
              {role.abbreviation} — {role.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold">
          First five activities
        </h2>

        <ul className="mt-3 space-y-3">
          {workflowData.activities
            .slice(0, 5)
            .map(activity => (
              <li
                key={activity.externalId}
                className="rounded-lg border border-border p-3"
              >
                <strong>
                  {activity.title}
                </strong>

                <div className="text-sm text-muted-foreground">
                  {activity.roleAbbreviation}
                  {" • "}
                  {activity.workflowBucketName}
                  {" • "}
                  {activity.durationMinutes} minutes
                </div>

                <div className="mt-2 text-xs">
                  Tools:{" "}
                  {activity.aiTools
                    .map(tool => tool.name)
                    .join(", ") || "None"}
                </div>
              </li>
            ))}
        </ul>
      </section>
    </section>
  );
}

interface CountCardProps {
  label: string;
  value: number;
}

function CountCard({
  label,
  value,
}: CountCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </article>
  );
}