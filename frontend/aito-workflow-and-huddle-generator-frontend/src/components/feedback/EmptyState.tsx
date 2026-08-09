//Displays a message when no data is available.
interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <section
      style={{
        padding: "32px",
        border: "1px dashed #94a3b8",
        borderRadius: "8px",
        textAlign: "center",
        background: "white",
      }}
    >
      <h2>{title}</h2>

      {description && (
        <p>{description}</p>
      )}
    </section>
  );
}