import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  children: ReactNode;
  maxWidth?: string; // New prop
}

export default function AuthCard({ title, children, maxWidth }: AuthCardProps) {
  return (
    <Card className={`w-full ${maxWidth || 'max-w-lg'} mx-auto`}>
      <CardHeader>
        <CardTitle className="text-2xl text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
