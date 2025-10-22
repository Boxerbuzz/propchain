import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mermaid } from "@/components/ui/mermaid";
import { Info, User, Monitor } from "lucide-react";

interface FlowDiagramProps {
  title: string;
  description: string;
  mermaidCode: string;
  userPerspective: React.ReactNode;
  technicalPerspective: React.ReactNode;
}

const FlowDiagram = ({
  title,
  description,
  mermaidCode,
  userPerspective,
  technicalPerspective,
}: FlowDiagramProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mermaid Diagram */}
        <div className="bg-muted p-6 rounded-lg overflow-x-auto">
          <Mermaid chart={mermaidCode} />
        </div>

        {/* Legend */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <div className="flex flex-wrap gap-4">
              <span><strong className="text-green-600">Green:</strong> User actions</span>
              <span><strong className="text-blue-600">Blue:</strong> Blockchain operations</span>
              <span><strong className="text-purple-600">Purple:</strong> Smart contracts</span>
              <span><strong className="text-yellow-600">Yellow:</strong> System processes</span>
              <span><strong className="text-red-600">Red:</strong> Errors/Rejections</span>
            </div>
          </AlertDescription>
        </Alert>

        {/* Tabbed Perspectives */}
        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user" className="gap-2">
              <User className="h-4 w-4" />
              User Perspective
            </TabsTrigger>
            <TabsTrigger value="technical" className="gap-2">
              <Monitor className="h-4 w-4" />
              Technical Perspective
            </TabsTrigger>
          </TabsList>
          <TabsContent value="user" className="bg-muted p-4 rounded-lg mt-2">
            {userPerspective}
          </TabsContent>
          <TabsContent value="technical" className="bg-muted p-4 rounded-lg mt-2">
            {technicalPerspective}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FlowDiagram;
