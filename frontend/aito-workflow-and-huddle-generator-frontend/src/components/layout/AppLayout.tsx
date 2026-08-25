//Combines the top navigation header and page content into a common layout.
import {
  Outlet,
} from "react-router";

import {
  Header,
} from "./Header";
import { LayoutTour } from "./LayoutTour";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-primary/10 opacity-30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl" />
      </div>
      <Header />
      <LayoutTour />
      <main className="relative min-h-screen w-full min-w-0 pt-16">
        <Outlet />
      </main>
    </div>
  );
}
