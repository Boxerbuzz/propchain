import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="propchain-theme">
    <App />
  </ThemeProvider>
);
