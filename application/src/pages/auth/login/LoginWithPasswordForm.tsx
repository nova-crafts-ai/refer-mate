import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { useAuthActions } from "@/hooks/auth/useAuthActions";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import ForgotPassword from "./ForgotPassword";

const loginFormSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(3, "Password must be at least 3 characters")
    .max(20, "Password must not be more than 20 characters"),
});

const LoginWithPasswordForm = () => {
  const { signInWithPassword, signInWithGoogle } = useAuthActions();
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "all",
  });

  const onSubmit = ({ email, password }: z.infer<typeof loginFormSchema>) => {
    signInWithPassword.mutate({ email, password });
  };

  const isLoading = signInWithPassword.isPending;
  const firstError = Object.values(form.formState.errors)?.[0]?.message;
  const isFormInvalid =
    form.formState.isSubmitted && !form.formState.isValid && firstError;

  return (
    <form
      id="login-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {isFormInvalid && (
        <Alert variant="destructive">
          <AlertCircle className="w-5 h-5" />
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
      <ForgotPassword />
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || signInWithGoogle.isPending}
      >
        {isLoading && <Loader className="w-4 h-4 mr-2" />}
        Sign In
      </Button>
    </form>
  );
};

export default LoginWithPasswordForm;
