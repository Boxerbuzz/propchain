import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Bell, 
  User, 
  Wallet, 
  Menu, 
  Building, 
  TrendingUp, 
  MessageCircle,
  Settings,
  LogOut,
  Home,
  Search,
  BarChart3
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Browse', href: '/browse', icon: Search },
    { name: 'Portfolio', href: '/portfolio', icon: TrendingUp },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Manage', href: '/property/management', icon: Building }
  ];

  const userMenuItems = [
    { name: 'Profile', href: '/settings/profile', icon: User },
    { name: 'Wallet', href: '/wallet/dashboard', icon: Wallet },
    { name: 'Settings', href: '/settings/security', icon: Settings },
    { name: 'Logout', href: '#', icon: LogOut }
  ];

  const isActiveRoute = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const ConnectWalletButton = () => (
    <Button
      variant={isWalletConnected ? "secondary" : "default"}
      size="sm"
      className={`flex items-center gap-2 font-medium transition-all duration-200 ${
        isWalletConnected 
          ? "bg-success/10 border-success/20 text-success hover:bg-success/20" 
          : "bg-primary hover:bg-primary-hover"
      }`}
      onClick={() => !isWalletConnected && setIsWalletConnected(true)}
    >
      <Wallet className="h-4 w-4" />
      <span className="hidden sm:inline">
        {isWalletConnected ? "₦125,000" : "Connect Wallet"}
      </span>
    </Button>
  );

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 font-spartan">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-bold text-lg">PC</span>
          </div>
          <span className="text-xl font-bold text-foreground hidden sm:block tracking-tight">PropChain</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navigation.map((item) => {
            const isActive = isActiveRoute(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? "text-primary bg-primary/10 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Wallet Connect - Desktop */}
          <div className="hidden md:block">
            <ConnectWalletButton />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 transition-colors">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive">
              3
            </Badge>
          </Button>

          {/* Profile Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted/50 transition-colors">
                  <User className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 font-spartan">
                <div className="flex flex-col h-full">
                  <div className="border-b pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">John Doe</h3>
                        <p className="text-sm text-muted-foreground">john@example.com</p>
                      </div>
                    </div>
                  </div>
                  
                  <nav className="flex-1 space-y-1">
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted/50 transition-colors"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  
                  <div className="border-t pt-4">
                    <div className="flex gap-2">
                      <Link to="/auth/login" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link to="/auth/signup" className="flex-1">
                        <Button size="sm" className="w-full">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden hover:bg-muted/50 transition-colors">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 font-spartan">
              <div className="flex flex-col h-full">
                {/* Mobile Wallet Connect */}
                <div className="border-b pb-4 mb-4">
                  <ConnectWalletButton />
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 space-y-1">
                  {navigation.map((item) => {
                    const isActive = isActiveRoute(item.href);
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                {/* Mobile User Menu */}
                <div className="border-t pt-4 space-y-1">
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted/50 transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  ))}
                </div>
                
                {/* Mobile Auth Buttons */}
                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <Link to="/auth/login" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to="/auth/signup" className="flex-1">
                      <Button size="sm" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}