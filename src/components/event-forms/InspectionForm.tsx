import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useCreatePropertyEvent } from "@/hooks/usePropertyEvents";
import { Loader2, Sparkles } from "lucide-react";
import { useMockDataPrefill } from "@/hooks/useMockDataPrefill";

interface InspectionFormProps {
  propertyId: string;
  propertyTitle: string;
}

export const InspectionForm = ({ propertyId, propertyTitle }: InspectionFormProps) => {
  const createEvent = useCreatePropertyEvent();
  const { generateMockInspection } = useMockDataPrefill();
  const [formData, setFormData] = useState({
    inspection_type: "periodic",
    inspector_name: "",
    inspector_company: "",
    inspector_license: "",
    structural_condition: "good",
    foundation_status: "good",
    roof_status: "good",
    walls_status: "good",
    electrical_status: "good",
    plumbing_status: "good",
    overall_rating: 7,
    estimated_repair_cost: 0,
    market_value_estimate: 0,
    rental_value_estimate: 0,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    createEvent.mutate({
      property_id: propertyId,
      event_type: "inspection",
      event_data: {
        ...formData,
        conductor_name: formData.inspector_name,
        conductor_company: formData.inspector_company,
      },
    });

    // Reset form
    setFormData({
      inspection_type: "periodic",
      inspector_name: "",
      inspector_company: "",
      inspector_license: "",
      structural_condition: "good",
      foundation_status: "good",
      roof_status: "good",
      walls_status: "good",
      electrical_status: "good",
      plumbing_status: "good",
      overall_rating: 7,
      estimated_repair_cost: 0,
      market_value_estimate: 0,
      rental_value_estimate: 0,
      notes: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Inspection Type *</Label>
              <Select
                value={formData.inspection_type}
                onValueChange={(value) => setFormData({ ...formData, inspection_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initial">Initial</SelectItem>
                  <SelectItem value="periodic">Periodic</SelectItem>
                  <SelectItem value="pre_rental">Pre-Rental</SelectItem>
                  <SelectItem value="pre_sale">Pre-Sale</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Inspector Name *</Label>
              <Input
                required
                value={formData.inspector_name}
                onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                placeholder="Enter inspector name"
              />
            </div>

            <div className="space-y-2">
              <Label>Inspector Company</Label>
              <Input
                value={formData.inspector_company}
                onChange={(e) => setFormData({ ...formData, inspector_company: e.target.value })}
                placeholder="Company name"
              />
            </div>

            <div className="space-y-2">
              <Label>Inspector License</Label>
              <Input
                value={formData.inspector_license}
                onChange={(e) => setFormData({ ...formData, inspector_license: e.target.value })}
                placeholder="License number"
              />
            </div>
          </div>

          <div className="pt-4">
            <h3 className="font-semibold mb-4">Property Condition Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["structural_condition", "foundation_status", "roof_status", "walls_status", "electrical_status", "plumbing_status"].map((field) => (
                <div key={field} className="space-y-2">
                  <Label>{field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</Label>
                  <Select
                    value={formData[field as keyof typeof formData] as string}
                    onValueChange={(value) => setFormData({ ...formData, [field]: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <Label>Overall Rating (1-10) *</Label>
              <Input
                type="number"
                min="1"
                max="10"
                required
                value={formData.overall_rating}
                onChange={(e) => setFormData({ ...formData, overall_rating: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Estimated Repair Cost (₦)</Label>
              <Input
                type="number"
                min="0"
                value={formData.estimated_repair_cost}
                onChange={(e) => setFormData({ ...formData, estimated_repair_cost: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Market Value Estimate (₦)</Label>
              <Input
                type="number"
                min="0"
                value={formData.market_value_estimate}
                onChange={(e) => setFormData({ ...formData, market_value_estimate: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Rental Value Estimate (₦/month)</Label>
              <Input
                type="number"
                min="0"
                value={formData.rental_value_estimate}
                onChange={(e) => setFormData({ ...formData, rental_value_estimate: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional inspection notes..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData(generateMockInspection())}
              className="flex-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Mock Data
            </Button>
            <Button type="submit" disabled={createEvent.isPending} className="flex-1">
              {createEvent.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Record Event
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
