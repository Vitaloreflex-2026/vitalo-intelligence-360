import { Suspense, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Notification } from "@/components/admin/notification";
import { Error } from "@/components/admin/error";
import { Skeleton } from "@/components/ui/skeleton";

import { MeetingNotifications } from "../notifications/MeetingNotifications";
import { useConfigurationLoader } from "../root/useConfigurationLoader";
import Header from "./Header";

export const Layout = ({ children }: { children: ReactNode }) => {
  useConfigurationLoader();
  return (
    // The cream page lets the white cards stand out, as on the website.
    <div className="min-h-screen bg-vitalo-cream dark:bg-background">
      <Header />
      <main
        className="max-w-screen-xl mx-auto pt-4 px-4 pb-8"
        id="main-content"
      >
        <ErrorBoundary FallbackComponent={Error}>
          <Suspense fallback={<Skeleton className="h-12 w-12 rounded-full" />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </main>
      <MeetingNotifications />
      <Notification />
    </div>
  );
};
