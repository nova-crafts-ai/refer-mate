import { Loader } from "@/components/ui/loader";
import { useMessage } from "@/hooks/messages/useMessageData";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { EmailPreviewStatic } from "./EmailPreviewStatic";
import { SendEmailOptions } from "./send-email-options";
import { ROUTES } from "@/lib/consts/routesConsts";

const SendEmailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const parsedId = Number(id);
  const navigate = useNavigate();

  const { data: draft, isLoading, error } = useMessage(parsedId);

  const [alreadySent, setAlreadySent] = useState(false);

  // Auto-redirect if already completed
  useEffect(() => {
    if (draft?.status === "SENT" && !alreadySent) {
      setAlreadySent(true);
      toast.success("Email Already Sent!");
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD.fullPath);
      }, 3000);
    }
  }, [draft, navigate, alreadySent]);

  if (!id) {
    toast.info("No ID found. Redirecting to start.");
    navigate(ROUTES.OUTREACH.TEMPLATES.fullPath);
    return null;
  }

  if (isLoading || !draft) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    const err = new Error(
      "We were unable to fetch draft at the moment. Please try again later",
    );
    err.name = "Unexpected error occured";
    throw err;
  }

  if (alreadySent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="p-4 rounded-full bg-green-100 text-green-600">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold">Email Sent!</h2>
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fadeIn">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Side: Preview */}
          <div className="lg:col-span-3">
            <EmailPreviewStatic subject={draft.subject} body={draft.body} />
          </div>

          {/* Right Side: Actions */}
          <div className="lg:col-span-2">
            <SendEmailOptions id={draft.id} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SendEmailPage;
