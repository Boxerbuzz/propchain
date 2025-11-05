import { useEffect } from "react";

export function useBodyPointerEventsGuard() {
  useEffect(() => {
    const fix = () => {
      if (document.body.style.pointerEvents === "none") {
        document.body.style.pointerEvents = "auto";
      }
    };
    fix();
    const mo = new MutationObserver(fix);
    mo.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    const id = setInterval(fix, 300);
    return () => {
      mo.disconnect();
      clearInterval(id);
    };
  }, []);
}
