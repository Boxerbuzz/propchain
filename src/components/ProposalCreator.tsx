import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ProposalCreatorProps {
  roomId: string;
  propertyId: string;
  tokenizationId: string;
  onClose: () => void;
}

export const ProposalCreator = ({ roomId, propertyId, tokenizationId, onClose }: ProposalCreatorProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [proposalType, setProposalType] = useState<string>("");
  const [budgetNgn, setBudgetNgn] = useState("");
  const [votingPeriodDays, setVotingPeriodDays] = useState("7");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !proposalType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-proposal', {
        body: {
          room_id: roomId,
          property_id: propertyId,
          tokenization_id: tokenizationId,
          title,
          description,
          proposal_type: proposalType,
          budget_ngn: budgetNgn ? parseFloat(budgetNgn) : null,
          voting_period_days: parseInt(votingPeriodDays)
        }
      });

      if (error) throw error;

      toast.success("Proposal created successfully!");
      onClose();
    } catch (error: any) {
      console.error('Error creating proposal:', error);
      toast.error(error.message || "Failed to create proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Create Proposal</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Proposal title"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your proposal"
            rows={4}
            required
          />
        </div>

        <div>
          <Label htmlFor="type">Type *</Label>
          <Select value={proposalType} onValueChange={setProposalType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="improvement">Improvement</SelectItem>
              <SelectItem value="dividend">Dividend Distribution</SelectItem>
              <SelectItem value="sale">Property Sale</SelectItem>
              <SelectItem value="management">Management Change</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="budget">Budget (₦)</Label>
          <Input
            id="budget"
            type="number"
            value={budgetNgn}
            onChange={(e) => setBudgetNgn(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <Label htmlFor="votingPeriod">Voting Period (days)</Label>
          <Input
            id="votingPeriod"
            type="number"
            value={votingPeriodDays}
            onChange={(e) => setVotingPeriodDays(e.target.value)}
            min="1"
            max="30"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Proposal
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};
