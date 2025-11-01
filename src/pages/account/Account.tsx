import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Compass,
  Coins,
  ChevronRight,
  Menu,
  LayoutDashboard,
  ArrowUpFromLine,
  ArrowDownToLine,
  CirclePlus,
  CircleMinus,
  Send,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AccountLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tokensExpanded, setTokensExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNavItems = [
    {
      name: "Overview",
      href: "/account/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Discovery",
      href: "/account/discovery",
      icon: Compass,
    },
    {
      name: "Tokens",
      icon: Coins,
      hasSubmenu: true,
      submenuType: "tokens",
    },
  ];

  const tokensSubmenu = [
    {
      name: "Buy",
      href: "/account/tokens/buy",
      icon: CirclePlus,
    },
    {
      name: "Sell",
      href: "/account/tokens/sell",
      icon: CircleMinus,
    },
    {
      name: "Send",
      href: "/account/tokens/send",
      icon: Send,
    },
    {
      name: "Swap",
      href: "/account/tokens/swap",
      icon: ArrowLeftRight,
    },
    {
      name: "Fund",
      href: "/account/wallet/fund",
      icon: ArrowDownToLine,
    },
    {
      name: "Withdraw",
      href: "/account/wallet/withdraw",
      icon: ArrowUpFromLine,
    },
  ];

  const isActive = (href: string) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  const handleNavClick = (item: (typeof mainNavItems)[0]) => {
    if (item.hasSubmenu) {
      if (item.submenuType === "tokens") {
        setTokensExpanded(!tokensExpanded);
      }
    } else if (item.href) {
      navigate(item.href);
      setTokensExpanded(false);
    }
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {mainNavItems.map((item) => (
            <div key={item.name}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  item.href &&
                    isActive(item.href) &&
                    "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                onClick={() => {
                  handleNavClick(item);
                  if (isMobile && !item.hasSubmenu) setMobileMenuOpen(false);
                }}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">{item.name}</span>
                {item.hasSubmenu && (
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform",
                      item.submenuType === "tokens" &&
                        tokensExpanded &&
                        "rotate-90"
                    )}
                  />
                )}
              </Button>

              {/* Submenu items (Mobile) */}
              {isMobile &&
                item.hasSubmenu &&
                item.submenuType === "tokens" &&
                tokensExpanded && (
                  <div className="ml-8 mt-2 space-y-2">
                    {tokensSubmenu.map((subItem) => (
                      <Button
                        key={subItem.name}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start",
                          isActive(subItem.href) &&
                            "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                        onClick={() => {
                          navigate(subItem.href);
                          setTokensExpanded(false);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <subItem.icon className="h-4 w-4 mr-3" />
                        {subItem.name}
                      </Button>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-border flex flex-col items-center justify-center gap-2">
        <img src="/hedera.svg" alt="Hedera" className="w-10 h-10 mx-auto" />
        <p className="text-xs text-muted-foreground text-center font-medium">
          Built on Hedera
        </p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-card border-r border-border flex-col fixed left-0 top-16 h-[calc(100vh-4rem)]">
        <SidebarContent />
      </div>

      {/* Mobile Menu Button & Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-20 left-4 z-50 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <SidebarContent isMobile={true} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Tokens Floating Submenu (Desktop Only) */}
      {tokensExpanded && (
        <>
          {/* Backdrop */}
          <div
            className="hidden md:block fixed inset-0 top-16 bg-black/20 z-40"
            onClick={() => setTokensExpanded(false)}
          />

          {/* Floating Menu */}
          <div className="hidden md:block fixed left-64 top-16 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border shadow-xl z-50 animate-in slide-in-from-left">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold">Tokens</h3>
              <p className="text-sm text-muted-foreground">
                Manage your assets
              </p>
            </div>
            <nav className="p-4">
              <div className="space-y-2">
                {tokensSubmenu.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      isActive(item.href) &&
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    onClick={() => {
                      navigate(item.href);
                      setTokensExpanded(false);
                    }}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Button>
                ))}
              </div>
            </nav>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto md:ml-64">
        <Outlet />
      </div>
    </div>
  );
}
