import { Loader } from "@/components/ui/loader";
import { useSignIn } from "@clerk/clerk-react";
import { Outlet } from "react-router";
import FullLogo from "../function/FullLogo";
import { ROUTES } from "@/lib/consts/routesConsts";

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
        <FullLogo to={ROUTES.DASHBOARD.fullPath} />
      </div>
      <div className="w-full max-w-sm space-y-6">
        {!isLoaded ? loader : <Outlet />}
      </div>
    </div>
  );
}
