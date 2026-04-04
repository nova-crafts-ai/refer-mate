import SendEmailButton from "@/components/function/send-email-button";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import CopyToClipboardButton from "./CopyToClipboardButton";
import ManageFollowUps from "./ManageFollowUps";
import { ROUTES } from "@/lib/consts/routesConsts";

interface SendEmailOptionsProps {
  id: number;
}

export const SendEmailOptions = ({ id }: SendEmailOptionsProps) => {
  const navigate = useNavigate();
  const [manageThread, setManageThread] = useState(true);

  return (
    <div className="space-y-6 lg:sticky lg:top-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Ready to Send?</h3>
        <p className="text-sm text-muted-foreground">
          Review your email. When you're ready, send it directly or copy to
          clipboard.
        </p>
      </div>

      <div className="space-y-3">
        <ManageFollowUps
          manageThread={manageThread}
          setManageThread={setManageThread}
        />
        <SendEmailButton
          id={id}
          manageThread={manageThread}
          onSend={() => {
            setTimeout(() => navigate(ROUTES.DASHBOARD.fullPath), 3000);
          }}
        />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <CopyToClipboardButton id={id} />

      {/* Helper Text */}
      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-3xl border border-blue-100 dark:border-blue-900/20">
        <div className="flex items-start">
          <Mail className="w-5 h-5 text-blue-500 mt-0.5 mr-3 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Tip
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Connecting your Gmail allows us to track your email trail, send
              automated follow-ups and notify you if a response is received.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center gap-1">
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTES.OUTREACH.PREVIEW.getFullPath(String(id)))}
          className="w-full"
        >
          Back to Edit
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.DASHBOARD.fullPath)}
          className="w-full"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};
