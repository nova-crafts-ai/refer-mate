import { useClerk } from "@clerk/clerk-react";
import { LogOut } from "lucide-react";
import { Outlet } from "react-router";
import { Button } from "../ui/button";
import FullLogo from "../function/FullLogo";

const OnboardingLayout = () => {
  const { signOut } = useClerk();
  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      {/* Background Pattern */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-10 opacity-30 dark:opacity-10 pointer-events-none" />
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16 flex items-center px-8 justify-between">
        <FullLogo />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-3xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default OnboardingLayout;
