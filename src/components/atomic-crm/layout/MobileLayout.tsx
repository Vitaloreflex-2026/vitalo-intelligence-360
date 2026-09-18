import { Error } from "@/components/admin/error";
import { Notification } from "@/components/admin/notification";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { MeetingNotifications } from "../notifications/MeetingNotifications";
import { useConfigurationLoader } from "../root/useConfigurationLoader";
import { MobileNavigation } from "./MobileNavigation";
import { MobileTopBar } from "./MobileTopBar";
import { PullToRefresh } from "./PullToRefresh";

export const MobileLayout = ({ children }: { children: ReactNode }) => {
  useConfigurationLoader();
  return (
    <>
      <PullToRefresh />
      <MobileTopBar />
      {/*
        <MobileTopBar> and <MobileNavigation> are both fixed to the edges of the
        viewport, so every page — including the ones reusing a desktop screen —
        needs room for them. Reserving it here rather than per page is what
        covers the screens that have no <MobileHeader> of their own.
      */}
      <div className="pt-[var(--mobile-topbar-height)] pb-[var(--mobile-nav-height)]">
        <ErrorBoundary FallbackComponent={Error}>
          <Suspense fallback={<Skeleton className="h-12 w-12 rounded-full" />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </div>
      <MeetingNotifications />
      <MobileNavigation />
      {/* Sits just above the bottom bar, whatever height the device gives it */}
      <Notification mobileOffset={{ bottom: "var(--mobile-nav-height)" }} />
    </>
  );
};
