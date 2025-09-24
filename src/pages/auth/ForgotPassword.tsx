import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import AuthCard from "@/components/auth/AuthCard";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

// Define a Zod schema for the email input
const ForgotPasswordFormSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof ForgotPasswordFormSchema>;

export default function ForgotPassword() {
  const { resetPassword, loading } = useAuth();
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormData) => {
    const errorMessage = await resetPassword(values.email);
    if (errorMessage) {
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password Reset Email Sent",
        description:
          "Please check your email for a link to reset your password.",
      });
      // Optionally redirect to a success page or back to login
      // navigate("/auth/login");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <AuthCard title="Forgot Password?">
        <p className="text-muted-foreground text-center mb-6">
          Enter your email address and we'll send you a reset link
        </p>

        <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6">
          <Mail className="w-8 h-8 text-primary" />
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              className="mt-1"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? <Spinner className="mr-2" /> : "Send Reset Link"}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <Link
            to="/auth/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to login
          </Link>
        </div>
      </AuthCard>

      {/* Help Section */}
      <div className="mt-6 text-center w-full max-w-md">
        <p className="text-xs text-muted-foreground">
          Having trouble?{" "}
          <Link to="/support" className="text-primary hover:text-primary/80">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
