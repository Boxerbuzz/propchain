import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useCreatePropertyEvent } from "@/hooks/usePropertyEvents";
import { Loader2 } from "lucide-react";

interface RentalFormProps {
  propertyId: string;
  propertyTitle: string;
}

export const RentalForm = ({ propertyId, propertyTitle }: RentalFormProps) => {
  const createEvent = useCreatePropertyEvent();
  const [formData, setFormData] = useState({
    rental_type: "long_term",
    tenant_name: "",
    tenant_email: "",
    tenant_phone: "",
    tenant_id_number: "",
    monthly_rent_ngn: 0,
    security_deposit_ngn: 0,
    agency_fee_ngn: 0,
    legal_fee_ngn: 0,
    start_date: "",
    end_date: "",
    lease_duration_months: 12,
    payment_method: "bank_transfer",
    payment_status: "pending",
    amount_paid_ngn: 0,
    special_terms: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    createEvent.mutate({
      property_id: propertyId,
      event_type: "rental",
      event_data: {
        ...formData,
        amount_ngn: formData.monthly_rent_ngn,
        conductor_name: formData.tenant_name,
      },
    });

    // Reset form
    setFormData({
      rental_type: "long_term",
      tenant_name: "",
      tenant_email: "",
      tenant_phone: "",
      tenant_id_number: "",
      monthly_rent_ngn: 0,
      security_deposit_ngn: 0,
      agency_fee_ngn: 0,
      legal_fee_ngn: 0,
      start_date: "",
      end_date: "",
      lease_duration_months: 12,
      payment_method: "bank_transfer",
      payment_status: "pending",
      amount_paid_ngn: 0,
      special_terms: "",
      notes: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rental Type *</Label>
              <Select
                value={formData.rental_type}
                onValueChange={(value) => setFormData({ ...formData, rental_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short_term">Short Term</SelectItem>
                  <SelectItem value="long_term">Long Term</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tenant Name *</Label>
              <Input
                required
                value={formData.tenant_name}
                onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                placeholder="Full name"
              />
            </div>

            <div className="space-y-2">
              <Label>Tenant Email</Label>
              <Input
                type="email"
                value={formData.tenant_email}
                onChange={(e) => setFormData({ ...formData, tenant_email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Tenant Phone</Label>
              <Input
                value={formData.tenant_phone}
                onChange={(e) => setFormData({ ...formData, tenant_phone: e.target.value })}
                placeholder="+234..."
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Tenant ID Number</Label>
              <Input
                value={formData.tenant_id_number}
                onChange={(e) => setFormData({ ...formData, tenant_id_number: e.target.value })}
                placeholder="ID or passport number"
              />
            </div>
          </div>

          <div className="pt-4">
            <h3 className="font-semibold mb-4">Financial Terms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly Rent (₦) *</Label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={formData.monthly_rent_ngn}
                  onChange={(e) => setFormData({ ...formData, monthly_rent_ngn: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Security Deposit (₦)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.security_deposit_ngn}
                  onChange={(e) => setFormData({ ...formData, security_deposit_ngn: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Agency Fee (₦)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.agency_fee_ngn}
                  onChange={(e) => setFormData({ ...formData, agency_fee_ngn: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Legal Fee (₦)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.legal_fee_ngn}
                  onChange={(e) => setFormData({ ...formData, legal_fee_ngn: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="font-semibold mb-4">Rental Period</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Duration (months)</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.lease_duration_months}
                  onChange={(e) => setFormData({ ...formData, lease_duration_months: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="paystack">Paystack</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount Paid (₦)</Label>
              <Input
                type="number"
                min="0"
                value={formData.amount_paid_ngn}
                onChange={(e) => setFormData({ ...formData, amount_paid_ngn: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Special Terms</Label>
            <Textarea
              value={formData.special_terms}
              onChange={(e) => setFormData({ ...formData, special_terms: e.target.value })}
              placeholder="Any special terms or conditions..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={createEvent.isPending} className="w-full">
            {createEvent.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Record Rental on Blockchain
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};
