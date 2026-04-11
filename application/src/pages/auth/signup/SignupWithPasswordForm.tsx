import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { useAuthActions } from "@/hooks/auth/useAuthActions";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

const signupFormSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(3, "Password must be at least 3 characters")
    .max(20, "Password must not be more than 20 characters"),
});

interface SignupWithPasswordFormProps {
  onChangePendingVerification: (val: boolean) => void;
}

const SignupWithPasswordForm = ({
  onChangePendingVerification,
}: SignupWithPasswordFormProps) => {
  const { startSignUpWithPassword, signInWithGoogle } = useAuthActions();
  const form = useForm({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async ({
    email,
    password,
  }: z.infer<typeof signupFormSchema>) => {
    startSignUpWithPassword.mutate(
      { email, password },
      { onSuccess: () => onChangePendingVerification(true) },
    );
  };

  const isLoading = startSignUpWithPassword.isPending;
  const firstError = Object.values(form.formState.errors)?.[0]?.message;
  const isFormInvalid =
    form.formState.isSubmitted && !form.formState.isValid && firstError;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {isFormInvalid && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>{firstError}</AlertTitle>
        </Alert>
      )}
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            id={field.name}
            placeholder="john@example.com"
            aria-invalid={fieldState.invalid}
          />
        )}
      />
      <Controller
        name="password"
        control={form.control}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            id={field.name}
            type="password"
            aria-invalid={fieldState?.invalid}
            placeholder="Password"
            {...field}
          />
        )}
      />
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading && signInWithGoogle.isPending}
      >
        {isLoading && <Loader className="w-4 h-4 mr-2" />}
        Sign Up
      </Button>
    </form>
  );
};

export default SignupWithPasswordForm;
