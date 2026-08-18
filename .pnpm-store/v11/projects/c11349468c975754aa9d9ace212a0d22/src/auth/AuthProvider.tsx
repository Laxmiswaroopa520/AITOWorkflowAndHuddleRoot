//Wraps the React application with MsalProvider so all components can access the MSAL instance and authentication state.
import {
  EventType,
  type AuthenticationResult,
  type EventMessage,
  PublicClientApplication,
} from "@azure/msal-browser";

import {
  MsalProvider,
} from "@azure/msal-react";

import {
  type PropsWithChildren,
  useEffect,
} from "react";

interface AuthProviderProps
  extends PropsWithChildren {
  instance: PublicClientApplication;
}

export function AuthProvider({
  instance,
  children,
}: AuthProviderProps) {
  useEffect(() => {
    const callbackId =
      instance.addEventCallback(
        (event: EventMessage) => {
          if (
            event.eventType ===
              EventType.LOGIN_SUCCESS &&
            event.payload
          ) {
            const authenticationResult =
              event.payload as AuthenticationResult;

            instance.setActiveAccount(
              authenticationResult.account,
            );
          }
        },
      );

    return () => {
      if (callbackId) {
        instance.removeEventCallback(
          callbackId,
        );
      }
    };
  }, [instance]);

  return (
    <MsalProvider instance={instance}>
      {children}
    </MsalProvider>
  );
}