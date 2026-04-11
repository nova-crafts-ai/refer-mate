import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader } from "@/components/ui/loader";
import { useAuthActions } from "@/hooks/auth/useAuthActions";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

const verifySignUpCodeFormSchema = z.object({
  code: z.string().length(6, "Code must have 6 digits"),
});

const VerifySignUpCodeForm = () => {
  const { verifySignUpWithCode } = useAuthActions();
  const form = useForm({
    resolver: zodResolver(verifySignUpCodeFormSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async ({
    code,
  }: z.infer<typeof verifySignUpCodeFormSchema>) => {
    verifySignUpWithCode.mutate({ code });
  };

  const isLoading = verifySignUpWithCode.isPending;
  const firstError = Object.values(form.formState.errors)?.[0]?.message;
  const isFormInvalid =
    form.formState.isSubmitted && !form.formState.isValid && firstError;

  return (
    <form
      id="verify-signup-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {isFormInvalid && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>{firstError}</AlertTitle>
        </Alert>
      )}
      <div className="flex justify-center">
        <Controller
          name="code"
          disabled={isLoading}
          control={form.control}
          render={({ field }) => (
            <InputOTP maxLength={6} {...field}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          )}
        />
      </div>
      <Button
        type="submit"
        className="w-full h-10 font-medium"
        disabled={isLoading}
      >
        {isLoading && <Loader className="w-4 h-4 mr-2" />}
        Verify Email
      </Button>
    </form>
  );
};

export default VerifySignUpCodeForm;
