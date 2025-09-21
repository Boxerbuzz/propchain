import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordRequirements = [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "One uppercase letter", met: /[A-Z]/.test(password) },
    { text: "One lowercase letter", met: /[a-z]/.test(password) },
    { text: "One number", met: /\d/.test(password) },
    { text: "One special character", met: /[!@#$%^&*]/.test(password) }
  ];

  const passwordsMatch = password === confirmPassword && password.length > 0;

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
          <h1 className="text-2xl font-bold text-foreground mb-2">Create Your Account</h1>
          <p className="text-muted-foreground">Join thousands of investors on PropChain</p>
        </div>

        {/* Signup Form */}
        <div className="bg-card border border-border rounded-xl p-6">
          <form className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@email.com"
                className="mt-1"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 800 000 0000"
                className="mt-1"
                required
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
              
              {/* Password Requirements */}
              {password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                        req.met ? 'bg-success' : 'bg-muted border border-border'
                      }`}>
                        {req.met && <Check className="w-2 h-2 text-white" />}
                      </div>
                      <span className={`text-xs ${
                        req.met ? 'text-success' : 'text-muted-foreground'
                      }`}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                    passwordsMatch ? 'bg-success' : 'bg-destructive'
                  }`}>
                    {passwordsMatch && <Check className="w-2 h-2 text-white" />}
                  </div>
                  <span className={`text-xs ${
                    passwordsMatch ? 'text-success' : 'text-destructive'
                  }`}>
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </span>
                </div>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start space-x-2">
              <Checkbox id="terms" className="mt-1" />
              <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                I agree to PropChain's{" "}
                <Link to="/terms" className="text-primary hover:text-primary-hover">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:text-primary-hover">
                  Privacy Policy
                </Link>, and confirm that I am at least 18 years old.
              </Label>
            </div>

            {/* Marketing Consent */}
            <div className="flex items-center space-x-2">
              <Checkbox id="marketing" />
              <Label htmlFor="marketing" className="text-sm text-muted-foreground">
                I'd like to receive updates about new investment opportunities
              </Label>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full btn-primary" size="lg">
              Create Account
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

          {/* Social Signup */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full" size="lg">
              <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google" 
                className="w-4 h-4 mr-2"
              />
              Sign up with Google
            </Button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-primary hover:text-primary-hover font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}