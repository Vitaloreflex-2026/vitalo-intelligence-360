import { useConfigurationContext } from "../root/ConfigurationContext";
import { MobileCreateButton } from "./MobileCreateButton";
import { MobileMoreMenu } from "./MobileMoreMenu";
import { MobileRefreshButton } from "./MobileRefreshButton";

/**
 * The global mobile top bar, rendered once by <MobileLayout> so that creating a
 * record, refreshing and the secondary screens are reachable from EVERY page —
 * including the ones that reuse a desktop screen and have no <MobileHeader>.
 *
 * It comes in two fixed layers that together behave as one bar:
 *
 *  - the identity strip, *behind* any page-specific <MobileHeader>. The two
 *    share their geometry and background, so a page with a header of its own
 *    simply covers this one, and a page without shows the app name.
 *  - the action cluster, *above* both, so the global actions stay on top
 *    whichever header is underneath. <MobileHeader> keeps its right side clear
 *    for it.
 */
export const MobileTopBar = () => {
  const { darkModeLogo, lightModeLogo, title } = useConfigurationContext();

  return (
    <>
      <div className="fixed top-0 right-0 left-0 z-10 bg-secondary pt-[env(safe-area-inset-top)]">
        <div className="flex h-14 items-center gap-2 px-4 text-secondary-foreground">
          <img className="h-6 [.light_&]:hidden" src={darkModeLogo} alt="" />
          <img className="h-6 [.dark_&]:hidden" src={lightModeLogo} alt="" />
          <h1 className="truncate text-xl font-semibold">{title}</h1>
        </div>
      </div>
      <div className="fixed top-0 right-0 z-30 pt-[env(safe-area-inset-top)]">
        <div className="flex h-14 items-center gap-1 px-2">
          <MobileCreateButton />
          <MobileRefreshButton />
          <MobileMoreMenu />
        </div>
      </div>
    </>
  );
};
