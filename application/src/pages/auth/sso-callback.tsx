import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useClerk } from "@clerk/clerk-react";
import { useLayoutEffect } from "react";

const SSOCallbackPage = () => {
  const { handleRedirectCallback } = useClerk();
  useLayoutEffect(() => {
    handleRedirectCallback({});
  }, [handleRedirectCallback]);

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Loader size="lg" />
        <p className="mt-4 text-sm text-muted-foreground">
          Redirecting you to the dashboard...
        </p>
      </CardContent>
    </Card>
  );
};
export default SSOCallbackPage;
