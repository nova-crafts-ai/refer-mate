import { Loader } from "@/components/ui/loader";
import { useSignIn } from "@clerk/clerk-react";
import { Link, Outlet } from "react-router";

export default function AuthLayout() {
  const { isLoaded } = useSignIn();

  const loader = (
    <div className="flex justify-center py-8">
      <Loader />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden p-4">
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            O
          </div>
          <span>Outreach</span>
        </Link>
      </div>
      <div className="w-full max-w-sm space-y-6">
        {!isLoaded ? loader : <Outlet />}
      </div>
    </div>
  );
}
