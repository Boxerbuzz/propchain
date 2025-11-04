import React, { useEffect } from "react";

// Lightweight, opt-in Chatway loader. Enable with VITE_ENABLE_CHATWAY=true
// Keeps widget from interfering with app overlays by deferring load and setting a safe z-index.
const CHATWAY_SRC = "https://cdn.chatway.app/widget.js?id=aWmh7jU6nP1G";

declare global {
  interface Window {
    chatwayConfig?: Record<string, unknown>;
  }
}

export function ChatwayWidget() {
  const enabled = import.meta.env.VITE_ENABLE_CHATWAY === "true";

  useEffect(() => {
    if (!enabled) return;

    // Set a safe z-index so our modals (z-50) take precedence
    window.chatwayConfig = {
      ...(window.chatwayConfig || {}),
      zIndex: 40,
    };

    // Inject defensive CSS to avoid closed/hidden chat layers blocking the app
    const style = document.createElement("style");
    style.setAttribute("data-chatway-guard", "true");
    style.textContent = `
      /* Ensure hidden chat containers never block interactions */
      .chatway--frame-container[aria-hidden="true"],
      .chatway--preview-container[aria-hidden="true"] {
        pointer-events: none !important;
      }
      /* Keep the chat trigger above content but below our modals when open */
      .chatway--trigger-container { z-index: 60 !important; }
      .chatway--frame-container { z-index: 40 !important; }
    `;
    document.head.appendChild(style);

    // Load the script lazily
    const s = document.createElement("script");
    s.src = CHATWAY_SRC;
    s.async = true;
    s.crossOrigin = "anonymous";
    document.body.appendChild(s);

    return () => {
      // Cleanup on unmount
      s.remove();
      style.remove();
    };
  }, [enabled]);

  return null;
}

export default ChatwayWidget;
