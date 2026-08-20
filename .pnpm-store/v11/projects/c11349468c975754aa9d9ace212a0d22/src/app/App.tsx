import {
  RouterProvider,
} from "react-router/dom";

import {
  router,
} from "./router";

export function App() {
  return (
    <RouterProvider router={router} />        //Use the routes defined inside router.tsx and decide which page should be displayed based on the current browser URL."
  );
}