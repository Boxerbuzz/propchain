import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background font-spartan">
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
