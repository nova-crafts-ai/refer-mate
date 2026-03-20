import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader } from "@/components/ui/loader";
import { useReverificationActions } from "@/hooks/auth/useReverificationActions";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

const reverificationFormSchema = z.object({
  code: z.string().length(6, "Code must have 6 digits"),
});

interface ReverificationFormProps {
  code: string;
  onChangeCode: (code: string) => void;
  onComplete: () => void;
  onCancel: () => void;
}

const ReverificationForm = ({
  code,
  onChangeCode,
  onComplete,
  onCancel,
}: ReverificationFormProps) => {
  const { sendCode, verify } = useReverificationActions();
  const form = useForm({
    resolver: zodResolver(reverificationFormSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async ({
    code,
  }: z.infer<typeof reverificationFormSchema>) => {
    verify.mutate(
      { code },
      {
        onSuccess: () => {
          onChangeCode("");
          onComplete();
        },
      },
    );
  };

  const handleResend = async () => {
    onChangeCode("");
    verify.reset();
    sendCode.mutate();
  };

  const isLoading = sendCode.isPending || verify.isPending;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {form.formState.isSubmitted && !form.formState.isValid && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <AlertTitle>
            {Object.values(form.formState.errors)?.[0]?.message}
          </AlertTitle>
        </Alert>
      )}

      <div className="flex justify-center py-2">
        <Controller
          disabled={isLoading}
          name="code"
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
      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          className="w-full h-10 font-medium"
          disabled={isLoading || code.length !== 6}
        >
          {sendCode.isPending && <Loader className="w-4 h-4 mr-2" />}
          Verify
        </Button>

        <div className="flex items-center justify-between text-sm mt-3">
          <Button
            type="button"
            variant="link"
            onClick={onCancel}
            disabled={isLoading}
            className="text-muted-foreground p-0 h-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="link"
            onClick={handleResend}
            disabled={isLoading}
            className="text-primary p-0 h-auto font-semibold"
          >
            {sendCode.isPending && <Loader className="w-3 h-3 mr-1" />}
            Resend code
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ReverificationForm;
