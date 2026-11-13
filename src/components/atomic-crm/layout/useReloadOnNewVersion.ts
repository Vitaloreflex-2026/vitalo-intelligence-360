import { useEffect } from "react";
import { useLocation } from "react-router";

// Tabs left open for days never navigate for real (the router only rewrites
// the URL fragment), so the browser never looks for a new service worker on
// its own.
const UPDATE_CHECK_INTERVAL_MS = 15 * 60 * 1000;

let isNewVersionActive = false;

/**
 * Notices when a deploy reaches an open tab.
 *
 * Each deploy ships a new service worker, which takes control of the open tabs
 * right away (skipWaiting + clientsClaim) while they keep running the old code.
 * Called before the app renders, so a switch that happens on the login page is
 * not missed.
 */
export const watchForNewVersion = (): void => {
  if (!("serviceWorker" in navigator)) return;

  // ponytail: also fires once on a browser's very first visit, when the first
  // worker takes control. That costs one extra reload, ever, per browser.
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    isNewVersionActive = true;
  });

  navigator.serviceWorker.ready.then((registration) => {
    setInterval(() => {
      registration.update().catch(() => {
        // Offline or server unreachable: the next check retries.
      });
    }, UPDATE_CHECK_INTERVAL_MS);
  });
};

/**
 * Reloads the tab on the new version at the next page change rather than right
 * away, so that nothing being typed in a form is lost.
 */
export const useReloadOnNewVersion = (): void => {
  const location = useLocation();
  useEffect(() => {
    if (isNewVersionActive) window.location.reload();
  }, [location]);
};
