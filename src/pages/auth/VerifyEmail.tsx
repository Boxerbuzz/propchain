import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function VerifyEmail() {
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Verify Your Email</h1>
          <p className="text-muted-foreground">We sent a verification code to your email address</p>
        </div>

        {/* Verification Form */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>

          <form className="space-y-6">
            {/* Verification Code */}
            <div>
              <Label htmlFor="code" className="text-sm font-medium text-foreground">
                Verification Code
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                className="mt-1 text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
            </div>

            {/* Verify Button */}
            <Button type="submit" className="w-full" size="lg">
              Verify Email
            </Button>
          </form>

          {/* Resend Code */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground mb-2">
              Didn't receive the code?
            </p>
            <Button variant="ghost" size="sm">
              Resend Code
            </Button>
          </div>

          {/* Back Link */}
          <div className="text-center mt-4">
            <Link 
              to="/auth/signup" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to signup
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Check your spam folder or{" "}
            <Link to="/support" className="text-primary hover:text-primary/80">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}