import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">PC</span>
            </div>
            <span className="text-2xl font-bold text-foreground">PropChain</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Forgot Password?</h1>
          <p className="text-muted-foreground">Enter your email address and we'll send you a reset link</p>
        </div>

        {/* Reset Form */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>

          <form className="space-y-6">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="mt-1"
                required
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg">
              Send Reset Link
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
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Having trouble?{" "}
            <Link to="/support" className="text-primary hover:text-primary/80">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}