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
  SavedWorkflowsPage,
} from "@/features/saved-workflows";

import {
  HuddlePage,
  LaunchPlannerPage,
} from "@/features/huddle";             // here you didn't mention specific page.. You did not specify a filename.

//When the module resolver sees a folder import  (feature/huddles) like this, it resolves the folder's entry module—commonly its index.ts.

import {
  WorkflowPage,
} from "@/features/workflow-builder";

import {
  HomePage,
} from "@/features/home";

import {
  ReferenceDataDiagnosticPage,
} from "@/features/workflow-builder/pages/ReferenceDataDiagnosticPage";

export const router =
  createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      ),
    },

    {
      element: (
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      ),

      children: [
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

        {
          path: "huddle/launch-planner",

          element: (
            <LaunchPlannerPage />
          ),
        },
      ],
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
          to="/"
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
  path: "workflows",
  element: (
    <SavedWorkflowsPage />
  ),
},
  ]);
*/
