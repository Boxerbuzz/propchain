import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import ChatwayWidget from "@/components/integrations/ChatwayWidget";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background font-spartan">
      {/* Chat widget is opt-in via VITE_ENABLE_CHATWAY to prevent modal conflicts */}
      <ChatwayWidget />
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
