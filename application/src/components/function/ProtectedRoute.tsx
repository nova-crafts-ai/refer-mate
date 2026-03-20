import { useProfile } from "@/hooks/profile/useProfileData";
import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet, useLocation } from "react-router";
import { Loader } from "@/components/ui/loader";

function ProtectedRoute() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { data: profile, isLoading, error } = useProfile();
  const location = useLocation();

  if (error) {
    const err = new Error("Failed to fetch profile. Please try again later");
    err.name = "Unable to reach servers";
    throw err;
  }

  const loading = !isUserLoaded || isLoading || !profile;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate to="/login" state={{ appRedirectUrl: window.location.href }} />
    );
  }

  // If user is not onboarded then, redirect to onboarding pages
  if (
    profile.status === "INCOMPLETE" &&
    !location.pathname.startsWith("/onboarding")
  )
    return <Navigate to="/onboarding/basic-info" replace />;
  if (
    (profile.status === "PARTIAL" || profile.status === "PROCESSING") &&
    !location.pathname.startsWith("/onboarding")
  )
    return <Navigate to="/onboarding/professional-info" />;

  // If user is onboarded and tries to access onboarding, redirect to dashboard
  if (
    profile.status === "COMPLETE" &&
    location.pathname.startsWith("/onboarding")
  ) {
    return <Navigate to="/dashboard" />;
  }

  return <>{<Outlet />}</>;
}

export default ProtectedRoute;