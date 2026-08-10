//Combines the top navigation header and page content into a common layout.
import {
  Outlet,
} from "react-router";

import {
  Header,
} from "./Header";

export function AppLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
      }}
    >
      <Header />

      <main style={{ width: "100%", minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
