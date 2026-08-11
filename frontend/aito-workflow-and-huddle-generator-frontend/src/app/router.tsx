/*Places protected routes inside ProtectedRoute and decides which pages require authentication.*/
import {
  createBrowserRouter,
  Navigate,
} from "react-router";

import {
  ProtectedRoute,
} from "@/auth/ProtectedRoute";

import {
  AppLayout,
} from "@/components/layout/AppLayout";

import {
  HealthDiagnosticPage,
} from "@/features/diagnostics/HealthDiagnosticPage";

import {
  SavedWorkflowsPage,
} from "@/features/saved-workflows";

import {
  HuddlePage,
} from "@/features/huddle";

import {
  WorkflowPage,
} from "@/features/workflow-builder";

import {
  ReferenceDataDiagnosticPage,
} from "@/features/workflow-builder/pages/ReferenceDataDiagnosticPage";

export const router =
  createBrowserRouter([
    {
      element: (
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      ),

      children: [
        {
          index: true,

          element: (
            <Navigate
              to="/workflow"
              replace
            />
          ),
        },

        {
          path: "workflow",

          element: (
            <WorkflowPage />
          ),
        },

        {
          path: "workflows",

          element: (
            <SavedWorkflowsPage />
          ),
        },

        {
          path: "huddle",

          element: (
            <HuddlePage />
          ),
        },
      ],
    },

    /*
     * Keep diagnostics public only when
     * you intentionally need unauthenticated
     * frontend/backend connectivity testing.
     */
    {
      path: "diagnostics",

      element: (
        <HealthDiagnosticPage />
      ),
    },

    /*
     * This contains reference data and should
     * normally remain protected.
     */
    {
      element: (
        <ProtectedRoute>
          <ReferenceDataDiagnosticPage />
        </ProtectedRoute>
      ),

      path:
        "reference-data-diagnostics",
    },

    {
      path: "*",

      element: (
        <Navigate
          to="/workflow"
          replace
        />
      ),
    },
  ]);










/*import {
  createBrowserRouter,
} from "react-router";

import {
  ProtectedRoute,
} from "../auth/ProtectedRoute";

import {
  WorkflowPage,
} from "@/features/workflow-builder";

import {
  AppLayout,
} from "../components/layout/AppLayout";

import {
  HealthDiagnosticPage,
} from "../features/diagnostics/HealthDiagnosticPage";

//optional route
import {
  ReferenceDataDiagnosticPage,
} from "@/features/workflow-builder/pages/ReferenceDataDiagnosticPage";

import {
  SavedWorkflowsPage,
} from "@/features/saved-workflows";

import {
  Navigate,
 // createBrowserRouter,
} from "react-router";
/*
import {
  WorkflowPage,
} from "@/features/workflow-builder/pages/WorkflowPage";*/
/*import {
  HomePage,
} from "../features/home/HomePage";
export const router =
  createBrowserRouter([
    {
      element: (
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      ),

      children: [
        {
          index: true,
          element: (
            <Navigate
              to="/workflow"
              replace
            />
          ),
        },

        {
          path: "workflow",
          element: <WorkflowPage />,
        },
      ],
    },

    {
      path: "diagnostics",
      element: (
        <HealthDiagnosticPage />
      ),
    },
    {
  path: "workflows",
  element: (
    <SavedWorkflowsPage />
  ),
},
  ]);
*/
