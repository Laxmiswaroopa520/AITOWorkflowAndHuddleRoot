//Combines Header, Sidebar, and page content into a common layout.
import {
  Outlet,
} from "react-router";

import {
  Header,
} from "./Header";

import {
  Sidebar,
} from "./Sidebar";

export function AppLayout() {
  return (
    <div>
      <Header />

      <div
        style={{
          display: "flex",
        }}
      >
        <Sidebar />

        <main
          style={{
            flex: 1,
            minWidth: 0,
            padding: "24px",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}