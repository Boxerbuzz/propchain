import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: "Investment Completed",
      message: "Your investment in Luxury Apartment Complex - Ikoyi has been processed",
      time: "2 min ago",
      type: "success",
      icon: CheckCircle,
      isRead: false
    },
    {
      id: 2,
      title: "New Property Available",
      message: "Commercial Plaza - Victoria Island is now available for investment",
      time: "1 hour ago",
      type: "info",
      icon: Building,
      isRead: true
    },
    {
      id: 3,
      title: "Payment Due",
      message: "Your next investment installment is due in 3 days",
      time: "2 hours ago",
      type: "warning",
      icon: AlertTriangle,
      isRead: false
    }
  ];

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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 transition-colors">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive">
                  {notifications.length}
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <Button variant="link" size="sm" className="text-xs" onClick={() => alert("Mark all as read clicked")}>Mark all as read</Button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${notification.type === "success" ? "bg-emerald-100 text-emerald-600" : notification.type === "warning" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}>
                        <notification.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{notification.title}</p>
                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <span className="h-2 w-2 rounded-full bg-blue-500" />
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{notification.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t flex justify-between">
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => alert("View All Notifications clicked")}>
                  View All Notifications
                </Button>
                <Button variant="ghost" size="sm" className="w-full text-xs text-destructive" onClick={() => alert("Clear All Notifications clicked")}>
                  Clear All
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Profile Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted/50 transition-colors">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">John Doe</p>
                      <p className="text-xs text-muted-foreground">john@example.com</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userMenuItems.slice(0, -1).map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link to={item.href} className="flex items-center gap-2 cursor-pointer">
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="#" className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <div className="flex gap-2">
                    <Link to="/auth/login" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Login
                      </Button>
                    </Link>
                    <Link to="/auth/signup" className="flex-1">
                      <Button size="sm" className="w-full text-xs">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
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