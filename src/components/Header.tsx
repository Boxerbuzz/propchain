import { Button } from "@/components/ui/button";
import { Bell, User, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">PC</span>
          </div>
          <span className="text-xl font-bold text-foreground">PropChain</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/browse" className="nav-item">Browse Properties</Link>
          <Link to="/portfolio" className="nav-item">Portfolio</Link>
          <Link to="/dashboard" className="nav-item">Dashboard</Link>
          <Link to="/governance" className="nav-item">Governance</Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {/* Wallet Balance */}
          <div className="hidden md:flex items-center space-x-2 bg-background-muted border border-border rounded-lg px-3 py-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">₦125,000</span>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs"></span>
          </Button>

          {/* Profile */}
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/auth/signup">
              <Button className="btn-primary">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}