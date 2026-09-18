import { type ReactNode } from "react";

export const MobileContent = ({ children }: { children: ReactNode }) => (
  <main
    // The room for both fixed bars is reserved by <MobileLayout>; this only
    // adds breathing room below the top one.
    className="mx-auto max-w-screen-xl overflow-y-auto px-4 pt-4 pb-6"
    id="main-content"
  >
    {children}
  </main>
);
