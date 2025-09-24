import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import { useForm } from "react-hook-form";
import { LoginFormSchema } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Spinner } from "@/components/ui/spinner";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useSupabaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginFormSchema>) => {
    // actionToast(login(values), {
    //   error: (e) => e.message,
    //   success: "Login Successful",
    //   loading: "Getting started...",
    // });

    //navigate("/dashboard");

    const errorMessage = await login(values.email, values.password);
    if (errorMessage) {
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <AuthCard title="Sign in to your account" maxWidth="max-w-xl">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="mt-1"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pr-10"
                {...form.register("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label
                htmlFor="remember"
                className="text-sm text-muted-foreground"
              >
                Remember me
              </Label>
            </div>
            <Link
              to="/auth/forgot-password"
              className="text-sm text-primary hover:text-primary-hover"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full btn-primary"
            size="lg"
            disabled={loading}
          >
            {loading ? <Spinner className="mr-2" /> : "Sign In"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">or</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full" size="lg">
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className="w-4 h-4 mr-2"
            />
            Continue with Google
          </Button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/auth/signup"
              className="text-primary hover:text-primary-hover font-medium"
            >
              Create account
            </Link>
          </p>
        </div>
      </AuthCard>

      {/* Security Notice */}
      <div className="mt-6 text-center w-full max-w-md">
        <p className="text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link to="/terms" className="text-primary hover:text-primary-hover">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-primary hover:text-primary-hover">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
