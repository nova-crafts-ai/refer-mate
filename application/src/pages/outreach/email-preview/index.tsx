import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { ArrowLeft, ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { EmailEditor } from "./EmailEditor";
import { useMessage } from "@/hooks/messages/useMessageData";
import { useMessageActions } from "@/hooks/messages/useMessageActions";
import { ROUTES } from "@/lib/consts/routesConsts";

const EmailPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const parsedId = Number(id);
  const navigate = useNavigate();
  const { state } = useLocation();

  const { data: draft, isLoading, error } = useMessage(parsedId);
  const { updateDraft } = useMessageActions();

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    setSubject(draft?.subject || "");
    setBody(draft?.body || "");
  }, [draft]);

  const handleBack = () => {
    if (state.type) {
      navigate(
        `${ROUTES.OUTREACH.RECIPIENT_INFO.fullPath}?template=${state.type}`,
      );
    } else {
      navigate(ROUTES.OUTREACH.TEMPLATES.fullPath);
    }
  };

  const handleContinue = async () => {
    if (!parsedId || isNaN(parsedId)) return;

    updateDraft.mutate({
      id: parsedId,
      subject: subject,
      body: body,
    });
    navigate(ROUTES.OUTREACH.SEND.getFullPath(String(id)));
  };

  if (!id) {
    handleBack();
    return null;
  }

  if (isLoading) {
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

  return (
    <div className="animate-fadeIn space-y-6">
      <EmailEditor
        subject={subject || ""}
        body={body || ""}
        onSubjectChange={(val) => setSubject(val)}
        onBodyChange={(val) => setBody(val)}
      />

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleBack}
          disabled={updateDraft.isPending}
        >
          <ArrowLeft className="w-4 h-4 mr-1 -ml-1" />
          Back
        </Button>
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={updateDraft.isPending}
        >
          Continue
          {updateDraft.isPending ? (
            <Loader className="mr-2" />
          ) : (
            <ArrowRight className="w-4 h-4 ml-1 -mr-1" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default EmailPreviewPage;
