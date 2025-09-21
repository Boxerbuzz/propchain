import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "../BaseRepository";
import { GovernanceProposal, Vote } from "../../types";

export class GovernanceRepository extends BaseRepository<GovernanceProposal> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "governance_proposals");
  }

  async createVote(data: Partial<Vote>): Promise<Vote | null> {
    const { data: createdData, error } = await this.supabase
      .from("votes")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return createdData as Vote;
  }

  async getVotesByProposalId(proposalId: string): Promise<Vote[]> {
    const { data, error } = await this.supabase
      .from("votes")
      .select("*")
      .eq("proposal_id", proposalId);
    if (error) throw error;
    return data as Vote[];
  }
}
