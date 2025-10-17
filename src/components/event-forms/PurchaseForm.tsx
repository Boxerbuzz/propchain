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

interface PurchaseFormProps {
  propertyId: string;
  propertyTitle: string;
}

export const PurchaseForm = ({ propertyId, propertyTitle }: PurchaseFormProps) => {
  const createEvent = useCreatePropertyEvent();
  const { generateMockPurchase } = useMockDataPrefill();
  const [formData, setFormData] = useState({
    transaction_type: "full_purchase",
    buyer_name: "",
    buyer_email: "",
    buyer_phone: "",
    buyer_id_number: "",
    seller_name: "",
    purchase_price_ngn: 0,
    purchase_price_usd: 0,
    tokens_involved: 0,
    percentage_sold: 0,
    payment_method: "bank_transfer",
    payment_plan: "outright",
    down_payment_ngn: 0,
    remaining_balance_ngn: 0,
    transaction_status: "pending",
    completion_date: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    createEvent.mutate({
      property_id: propertyId,
      event_type: "purchase",
      event_data: {
        ...formData,
        amount_ngn: formData.purchase_price_ngn,
        conductor_name: formData.buyer_name,
      },
    });

    // Reset form
    setFormData({
      transaction_type: "full_purchase",
      buyer_name: "",
      buyer_email: "",
      buyer_phone: "",
      buyer_id_number: "",
      seller_name: "",
      purchase_price_ngn: 0,
      purchase_price_usd: 0,
      tokens_involved: 0,
      percentage_sold: 0,
      payment_method: "bank_transfer",
      payment_plan: "outright",
      down_payment_ngn: 0,
      remaining_balance_ngn: 0,
      transaction_status: "pending",
      completion_date: "",
      notes: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Transaction Type *</Label>
              <Select
                value={formData.transaction_type}
                onValueChange={(value) => setFormData({ ...formData, transaction_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_purchase">Full Purchase</SelectItem>
                  <SelectItem value="partial_sellout">Partial Sellout</SelectItem>
                  <SelectItem value="token_buyback">Token Buyback</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Buyer Name *</Label>
              <Input
                required
                value={formData.buyer_name}
                onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                placeholder="Full name"
              />
            </div>

            <div className="space-y-2">
              <Label>Seller Name</Label>
              <Input
                value={formData.seller_name}
                onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                placeholder="Full name"
              />
            </div>

            <div className="space-y-2">
              <Label>Buyer Email</Label>
              <Input
                type="email"
                value={formData.buyer_email}
                onChange={(e) => setFormData({ ...formData, buyer_email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Buyer Phone</Label>
              <Input
                value={formData.buyer_phone}
                onChange={(e) => setFormData({ ...formData, buyer_phone: e.target.value })}
                placeholder="+234..."
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Buyer ID Number</Label>
              <Input
                value={formData.buyer_id_number}
                onChange={(e) => setFormData({ ...formData, buyer_id_number: e.target.value })}
                placeholder="ID or passport number"
              />
            </div>
          </div>

          <div className="pt-4">
            <h3 className="font-semibold mb-4">Financial Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Purchase Price (₦) *</Label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={formData.purchase_price_ngn}
                  onChange={(e) => setFormData({ ...formData, purchase_price_ngn: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Purchase Price (USD)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.purchase_price_usd}
                  onChange={(e) => setFormData({ ...formData, purchase_price_usd: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Tokens Involved</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.tokens_involved}
                  onChange={(e) => setFormData({ ...formData, tokens_involved: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Percentage Sold (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.percentage_sold}
                  onChange={(e) => setFormData({ ...formData, percentage_sold: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="font-semibold mb-4">Payment Terms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Plan</Label>
                <Select
                  value={formData.payment_plan}
                  onValueChange={(value) => setFormData({ ...formData, payment_plan: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outright">Outright</SelectItem>
                    <SelectItem value="installment">Installment</SelectItem>
                    <SelectItem value="mortgage">Mortgage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                <Label>Down Payment (₦)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.down_payment_ngn}
                  onChange={(e) => setFormData({ ...formData, down_payment_ngn: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Remaining Balance (₦)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.remaining_balance_ngn}
                  onChange={(e) => setFormData({ ...formData, remaining_balance_ngn: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <Label>Transaction Status</Label>
              <Select
                value={formData.transaction_status}
                onValueChange={(value) => setFormData({ ...formData, transaction_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Expected Completion Date</Label>
              <Input
                type="date"
                value={formData.completion_date}
                onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional transaction notes..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData(generateMockPurchase())}
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
