import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PropsWithId } from "@/lib/types/commonTypes";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import Details from "./Details";
import Actions from "./actions";
import { ROUTES } from "@/lib/consts/routesConsts";

export const DetailsAndActions = ({ id }: PropsWithId) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 lg:sticky lg:top-6 h-full flex flex-col pt-2">
      <div className="pl-2">
        <Button
          variant="link"
          onClick={() => navigate(ROUTES.DASHBOARD.fullPath)}
          className="text-muted-foreground -ml-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1 -ml-1" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-2">
        <Details id={id} />
        <Separator />
        <Actions id={id} />
      </div>
    </div>
  );
};
