//Stores the Microsoft Entra configuration, API scopes, redirect URI, cache settings, and login request used by MSAL.
import {
  BrowserCacheLocation,
  type AccountInfo,
  type Configuration,
  type RedirectRequest,
  type SilentRequest,
} from "@azure/msal-browser";

function requireEnvironmentVariable(
  name: keyof ImportMetaEnv,
): string {
  const value = import.meta.env[name];

  if (!value?.trim()) {
    throw new Error(
      `Required environment variable ${name} is missing.`,
    );
  }

  return value.trim();
}

const tenantId =
  requireEnvironmentVariable(
    "VITE_AZURE_TENANT_ID",
  );

const clientId =
  requireEnvironmentVariable(
    "VITE_AZURE_CLIENT_ID",
  );

const redirectUri =
  requireEnvironmentVariable(
    "VITE_REDIRECT_URI",
  );

export const backendApiScope =
  requireEnvironmentVariable(
    "VITE_API_SCOPE",
  );

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority:
      `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },

  cache: {
    cacheLocation:
      BrowserCacheLocation.SessionStorage,
  },
};

export const loginRequest: RedirectRequest = {
  scopes: [
    "openid",
    "profile",
    backendApiScope,
  ],
};

export function createTokenRequest(
  account: AccountInfo,
): SilentRequest {
  return {
    account,
    scopes: [backendApiScope],
  };
}