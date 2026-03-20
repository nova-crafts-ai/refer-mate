import { useUser } from "@clerk/clerk-react";
import { Loader } from "@/components/ui/loader";
import { Navigate, Outlet } from "react-router";

const PublicRoute = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  if (!isUserLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <>
      <Outlet />
    </>
  );
};

export default PublicRoute;
