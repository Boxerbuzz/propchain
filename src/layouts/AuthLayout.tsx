import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background font-spartan flex items-center justify-center">
      <Outlet />
    </div>
  );
}
