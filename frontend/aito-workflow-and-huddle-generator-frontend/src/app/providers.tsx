/*Registers global providers.
//Registers global providers like React Query and later MSAL.
Currently:

React Query

Later:

MSAL
Theme Provider
Toast Provider
Context Providers*/
/*Registers application-wide providers such as React Query; MSAL itself is supplied through AuthProvider.*/
import type {
  PropsWithChildren,
} from "react";

import {
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  ReactQueryDevtools,
} from "@tanstack/react-query-devtools";

import {
  queryClient,
} from "./queryClient";

export function AppProviders({
  children,
}: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {import.meta.env.DEV && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
}