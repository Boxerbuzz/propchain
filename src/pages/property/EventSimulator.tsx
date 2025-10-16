import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PropertyEventSimulator } from "@/components/PropertyEventSimulator";
import { MockDataGenerator } from "@/components/MockDataGenerator";

const EventSimulator = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get("propertyId");

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/property/management")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Management
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Property Event Simulator</h1>
          <p className="text-muted-foreground mt-2">
            Record property inspections, rentals, and purchase transactions on the Hedera blockchain
          </p>
        </div>

        <div className="grid gap-6 mb-6">
          {propertyId && <MockDataGenerator propertyId={propertyId} />}
        </div>

        <PropertyEventSimulator />
      </div>
    </div>
  );
};

export default EventSimulator;
