import { MobileRefreshButton } from "./MobileRefreshButton";

const MobileHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    // `viewport-fit=cover` lets the page run under the status bar, so the
    // header pads itself by the top inset instead of hiding beneath it.
    <header className="fixed top-0 left-0 right-0 z-10 w-full bg-secondary pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 items-center justify-between px-4">
        {children}
        <MobileRefreshButton />
      </div>
    </header>
  );
};

export default MobileHeader;
