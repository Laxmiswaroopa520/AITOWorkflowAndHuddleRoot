/*Creates and initializes the MSAL instance, processes redirect results, restores the active account, and starts React.*/
import {
  StrictMode,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import {
  PublicClientApplication,
} from "@azure/msal-browser";

import {
  App,
} from "./app/App";

import {
  AppProviders,
} from "./app/providers";

import {
  AuthProvider,
} from "./auth/AuthProvider";

import {
  msalConfig,
} from "./auth/msalConfig";

import "./styles/index.css";

async function bootstrap():
  Promise<void> {
  const msalInstance =
    new PublicClientApplication(
      msalConfig,
    );

  await msalInstance.initialize();

  const redirectResult =
    await msalInstance
      .handleRedirectPromise();

  if (redirectResult?.account) {
    msalInstance.setActiveAccount(
      redirectResult.account,
    );
  } else {
    const existingAccounts =
      msalInstance.getAllAccounts();

    if (
      existingAccounts.length === 1
    ) {
      msalInstance.setActiveAccount(
        existingAccounts[0],
      );
    }
  }

  const rootElement =
    document.getElementById("root");

  if (!rootElement) {
    throw new Error(
      "Root element with id 'root' was not found.",
    );
  }

  createRoot(rootElement).render(
    <StrictMode>
      <AuthProvider
        instance={msalInstance}
      >
        <AppProviders>
          <App />
        </AppProviders>
      </AuthProvider>
    </StrictMode>,
  );
}

bootstrap().catch(
  (error: unknown) => {
    console.error(
      "Application initialization failed.",
      error,
    );
  },
);



/*

import {
  StrictMode,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import {
  App,
} from "./app/App";

import {
  AppProviders,
} from "./app/providers";

import "./styles/index.css";

const rootElement =
  document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "The root HTML element was not found.",
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);

*/

















/*import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
*/