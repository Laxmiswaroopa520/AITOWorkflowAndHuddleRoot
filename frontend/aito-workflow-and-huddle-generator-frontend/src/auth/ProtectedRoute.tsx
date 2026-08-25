// Calls the public Health API endpoint to verify backend connectivity.
/*Prevents unauthenticated users from seeing protected application pages and renders AuthGate instead.*/
import type {
  PropsWithChildren,
} from "react";

import {
  AuthGate,
} from "@/auth/AuthGate";

export function ProtectedRoute({
  children,
}: PropsWithChildren) {
  return (
    <AuthGate>
      {children}
    </AuthGate>
  );
}

/*import {
  InteractionStatus,
} from "@azure/msal-browser";

import {
  useIsAuthenticated,
  useMsal,
} from "@azure/msal-react";

import {
  type PropsWithChildren,
  useEffect,
  useRef,
} from "react";

import {
  loginRequest,
} from "./msalConfig";

export function ProtectedRoute({
  children,
}: PropsWithChildren) {
  const isAuthenticated =
    useIsAuthenticated();

  const {
    instance,
    inProgress,
  } = useMsal();

  const loginStarted =
    useRef(false);

  useEffect(() => {
    if (
      !isAuthenticated &&
      inProgress ===
        InteractionStatus.None &&
      !loginStarted.current
    ) {
      loginStarted.current = true;

      void instance.loginRedirect(
        loginRequest,
      );
    }
  }, [
    inProgress,
    instance,
    isAuthenticated,
  ]);

  if (!isAuthenticated) {
    return (
      <div role="status">
        Signing you in...
      </div>
    );
  }

  return <>{children}</>;
}

*/








