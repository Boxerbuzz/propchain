import { Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background font-spartan flex items-center justify-center relative">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Outlet />
    </div>
  );
}
