import { type ReactNode } from "react";

export const MobileContent = ({ children }: { children: ReactNode }) => (
  <main
    // The room for the bottom navigation is reserved by <MobileLayout>
    className="max-w-screen-xl mx-auto pt-18 px-4 pb-6 min-h-screen overflow-y-auto"
    id="main-content"
  >
    {children}
  </main>
);
