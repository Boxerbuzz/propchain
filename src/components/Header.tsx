import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  CheckCircle,
  Heart,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import logo from "@/assets/logo.png";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const { notifications, markAllAsRead, clearReadNotifications } =
    useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "investment":
        return CheckCircle;
      case "property":
        return Building;
      case "payment":
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "investment":
        return "success";
      case "property":
        return "primary";
      case "payment":
        return "warning";
      default:
        return "primary";
    }
  };

  const formatNotificationTime = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hour ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} day ago`;
    }
  };

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Browse", href: "/browse", icon: Search },
    { name: "Portfolio", href: "/portfolio", icon: TrendingUp },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Chat", href: "/chat", icon: MessageCircle },
    { name: "Manage", href: "/property/management", icon: Building },
  ];

  const userMenuItems = [
    { name: "Profile", href: "/settings/profile", icon: User },
    { name: "Favorites", href: "/favorites", icon: Heart },
    { name: "Wallet", href: "/wallet/dashboard", icon: Wallet },
    { name: "Settings", href: "/settings/security", icon: Settings },
    { name: "Logout", href: "#", icon: LogOut },
  ];

  const isActiveRoute = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 font-spartan">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200"
        >
          <img
            src={logo}
            alt="PropChain"
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold text-foreground hidden sm:block tracking-tight">
            PropChain
          </span>
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
          {/* Currency Toggle */}
          <CurrencyToggle />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications (only when authenticated) */}
          {isAuthenticated && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-muted/50 transition-colors border border-border rounded-full"
                >
                  <Bell className="h-5 w-5 text-black dark:text-white" />
                  {notifications.filter((n) => !n.read_at).length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive">
                      {notifications.filter((n) => !n.read_at).length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-0 bg-background border-border/20 shadow-lg"
                align="end"
              >
                <div className="flex items-center justify-between p-3 border-b border-border/10">
                  <h3 className="font-semibold text-sm text-foreground">
                    Notifications
                  </h3>
                  {notifications.filter((n) => !n.read_at).length > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => markAllAsRead()}
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => {
                      const NotificationIcon = getNotificationIcon(
                        notification.notification_type
                      );
                      const color = getNotificationColor(
                        notification.notification_type
                      );

                      return (
                        <div
                          key={notification.id}
                          className="p-4 border-b border-border/10 last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                color === "success"
                                  ? "bg-green-500/10 text-green-600"
                                  : color === "warning"
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              <NotificationIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <p className="text-xs font-semibold text-foreground">
                                  {notification.title}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2">
                                {!notification.read_at && (
                                  <span className="h-1 w-1 rounded-full bg-primary" />
                                )}
                                <span className="text-[9px] text-muted-foreground">
                                  {formatNotificationTime(
                                    new Date(
                                      notification.created_at
                                    ).toISOString()
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No notifications
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-border/10 flex justify-between">
                  <Link to="/settings/notifications" className="flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground hover:text-foreground"
                    >
                      View All Notifications
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-destructive hover:text-destructive"
                    onClick={() => clearReadNotifications()}
                  >
                    Clear All
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Profile Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200 rounded-full border border-transparent hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.first_name} ${user?.last_name}&backgroundColor=6366f1,8b5cf6,ec4899,10b981`}
                      alt="User avatar"
                      className="w-8 h-8 rounded-full border-2 border-border"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-80 bg-card border border-border shadow-lg"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal p-0">
                    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.first_name} ${user?.last_name}&backgroundColor=6366f1,8b5cf6,ec4899,10b981`}
                          alt="User avatar"
                          className="w-10 h-10 rounded-full shadow-md ring-2 ring-background border-2 border-border"
                        />
                        <div className="flex flex-col space-y-1 min-w-0">
                          <p className="text-sm font-semibold text-card-foreground truncate">
                            {user?.first_name} {user?.last_name}
                          </p>
                          <p className="text-xs text-primary font-medium truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <div className="p-2">
                    {userMenuItems.slice(0, -1).map((item) => (
                      <DropdownMenuItem
                        key={item.name}
                        asChild
                        className="p-0 focus:bg-muted/50 focus:text-foreground"
                      >
                        <Link
                          to={item.href}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-card-foreground hover:bg-muted/50 transition-all duration-200 group"
                        >
                          <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <div className="border-t border-border p-2">
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive transition-all duration-200 group"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">Logout</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Link to="/auth/login">
                  <Button variant="outline" size="sm" className="text-xs">
                    Login
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button size="sm" className="text-xs">
                    Get started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-muted/50 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:w-80 bg-background border-l border-border"
            >
              <div className="flex flex-col h-full py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <img
                      src={logo}
                      alt="PropChain"
                      className="h-6 w-auto"
                    />
                    <span className="font-bold text-lg text-foreground">
                      PropChain
                    </span>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Main Navigation
                  </div>
                  {navigation.map((item) => {
                    const isActive = isActiveRoute(item.href);
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "text-primary bg-primary/10 shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:shadow-sm"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg transition-colors ${
                            isActive
                              ? "bg-primary/20"
                              : "bg-muted group-hover:bg-muted-foreground/10"
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="flex-1">{item.name}</span>
                        {isActive && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </Link>
                    );
                  })}
                </nav>

                {/* Mobile User Menu (only when authenticated) */}
                {isAuthenticated && (
                  <div className="border-t border-border pt-6 mt-6 space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                      Account
                    </div>
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (item.name === "Logout") {
                            logout();
                          }
                        }}
                        className="group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
                      >
                        <div className="p-2 rounded-lg bg-muted group-hover:bg-muted-foreground/10 transition-colors">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="flex-1">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Mobile Auth Buttons (only when not authenticated) */}
                {!isAuthenticated && (
                  <div className="border-t border-border pt-6 mt-6 space-y-4 flex flex-col gap-1">
                    <Link
                      to="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      to="/auth/signup"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
