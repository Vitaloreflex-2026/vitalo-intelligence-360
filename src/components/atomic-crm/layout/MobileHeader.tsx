/**
 * A page-specific mobile top bar (its title, or a search and filter row).
 *
 * It shares the geometry and background of the identity strip <MobileTopBar>
 * renders, so it simply covers it; and it leaves its right side clear for that
 * bar's action cluster, which stays above both.
 */
const MobileHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    // `viewport-fit=cover` lets the page run under the status bar, so the
    // header pads itself by the top inset instead of hiding beneath it.
    <header className="fixed top-0 right-0 left-0 z-20 w-full bg-secondary pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 items-center gap-2 pr-36 pl-4">{children}</div>
    </header>
  );
};

export default MobileHeader;
