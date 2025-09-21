import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "../BaseRepository";
import { Tokenization } from "../../types";

export class TokenizationRepository extends BaseRepository<Tokenization> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "tokenizations");
  }

  // Add tokenization-specific query methods here if needed
}
