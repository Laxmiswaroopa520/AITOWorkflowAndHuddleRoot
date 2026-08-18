//Shows a loading indicator while data is being fetched.
interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({
  message = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "16px",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: "20px",
          height: "20px",
          border: "3px solid #d1d5db",
          borderTopColor: "#2563eb",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />

      <span>{message}</span>
    </div>
  );
}