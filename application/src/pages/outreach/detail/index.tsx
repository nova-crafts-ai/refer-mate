import { Loader } from "@/components/ui/loader";
import { useThread } from "@/hooks/threads/useThreadData";
import React from "react";
import { useNavigate, useParams } from "react-router";
import { DetailsAndActions } from "./details-and-actions";
import { EmailThread } from "./EmailThread";
import { ROUTES } from "@/lib/consts/routesConsts";

const OutreachDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const parsedId = Number(id);
  const navigate = useNavigate();

  const { data, isLoading, error } = useThread(parsedId);

  if (!id || isNaN(parsedId)) {
    navigate(ROUTES.DASHBOARD.fullPath);
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-destructive font-medium">
          Failed to load outreach details.
        </div>
        <button
          onClick={() => navigate(ROUTES.DASHBOARD.fullPath)}
          className="text-primary hover:underline"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-80px)] p-6 animate-fadeIn ">
      <div className="lg:col-span-4 h-full overflow-hidden">
        <DetailsAndActions id={parsedId} />
      </div>
      <div className="lg:col-span-8 h-full overflow-hidden bg-muted/10">
        <EmailThread id={parsedId} />
      </div>
    </div>
  );
};

export default OutreachDetailPage;
