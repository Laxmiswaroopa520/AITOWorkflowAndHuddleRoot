/*Silently acquires an API access token for the signed-in account and falls back to an interactive flow when required.*/
import {
  InteractionRequiredAuthError,
  type AccountInfo,
} from "@azure/msal-browser";

import {
  useMsal,
} from "@azure/msal-react";

import {
  useCallback,
} from "react";

import {
  backendApiScope,
  createTokenRequest,
} from "./msalConfig";

export function useAccessToken():
  () => Promise<string> {
  const {
    instance,
    accounts,
  } = useMsal();

  return useCallback(
    async (): Promise<string> => {
      const account: AccountInfo | null =
        instance.getActiveAccount() ??
        accounts[0] ??
        null;

      if (!account) {
        throw new Error(
          "No authenticated Microsoft Entra account is available.",
        );
      }

      try {
        const result =
          await instance.acquireTokenSilent(
            createTokenRequest(account),
          );

        return result.accessToken;
      } catch (error: unknown) {
        if (
          error instanceof
          InteractionRequiredAuthError
        ) {
          await instance.acquireTokenRedirect({
            account,
            scopes: [backendApiScope],
          });

          throw new Error(
            "Interactive token acquisition was started.",
          );
        }

        throw error;
      }
    },
    [
      accounts,
      instance,
    ],
  );
}