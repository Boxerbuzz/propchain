import { useEffect, useRef } from "react";
import mermaid from "mermaid";
import { useAppTheme } from "@/hooks/useAppTheme";

interface MermaidProps {
  chart: string;
  className?: string;
}

export const Mermaid = ({ chart, className = "" }: MermaidProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useAppTheme();

  useEffect(() => {
    if (!containerRef.current || !chart) return;

    // Configure mermaid with theme
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? "dark" : "default",
      themeVariables: isDark
        ? {
            // Dark mode colors
            primaryColor: "#8b5cf6",
            primaryTextColor: "#fff",
            primaryBorderColor: "#7c3aed",
            lineColor: "#6b7280",
            secondaryColor: "#10b981",
            tertiaryColor: "#f59e0b",
            background: "#1f2937",
            mainBkg: "#374151",
            secondBkg: "#4b5563",
            textColor: "#f3f4f6",
            border1: "#4b5563",
            border2: "#6b7280",
            noteBkgColor: "#1f2937",
            noteTextColor: "#f3f4f6",
            noteBorderColor: "#4b5563",
          }
        : {
            // Light mode colors
            primaryColor: "#8b5cf6",
            primaryTextColor: "#fff",
            primaryBorderColor: "#7c3aed",
            lineColor: "#9ca3af",
            secondaryColor: "#10b981",
            tertiaryColor: "#f59e0b",
            background: "#ffffff",
            mainBkg: "#f9fafb",
            secondBkg: "#f3f4f6",
            textColor: "#1f2937",
            border1: "#e5e7eb",
            border2: "#d1d5db",
            noteBkgColor: "#f9fafb",
            noteTextColor: "#1f2937",
            noteBorderColor: "#e5e7eb",
          },
      flowchart: {
        curve: "basis",
        useMaxWidth: true,
        htmlLabels: true,
      },
      fontSize: 14,
    });

    // Generate unique ID for this diagram
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

    // Render the diagram
    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render(id, chart);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error("Mermaid rendering error:", error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="color: #ef4444; padding: 1rem; border: 1px solid #ef4444; border-radius: 0.5rem;">
              <strong>Diagram Error:</strong> Failed to render diagram. Check console for details.
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [chart, isDark]);

  return <div ref={containerRef} className={className} />;
};
