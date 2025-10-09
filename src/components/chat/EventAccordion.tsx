import { ReactNode } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface EventAccordionProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  children: ReactNode;
  defaultOpen?: boolean;
}

export const EventAccordion = ({
  icon: Icon,
  title,
  subtitle,
  badge,
  children,
  defaultOpen = false,
}: EventAccordionProps) => {
  return (
    <Card className="overflow-hidden border-l-4 border-l-primary/50 bg-accent/5">
      <Accordion type="single" collapsible defaultValue={defaultOpen ? "event-details" : undefined}>
        <AccordionItem value="event-details" className="border-none">
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/10">
            <div className="flex items-start gap-3 w-full">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-base">{title}</h4>
                  {badge && (
                    <Badge variant={badge.variant || "default"} className="text-xs">
                      {badge.label}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2">
            {children}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};
