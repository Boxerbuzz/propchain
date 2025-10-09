-- Create investment_documents table
CREATE TABLE IF NOT EXISTS public.investment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID REFERENCES public.investments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  tokenization_id UUID REFERENCES public.tokenizations(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('agreement', 'receipt')),
  document_url TEXT NOT NULL,
  document_number TEXT NOT NULL UNIQUE,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_investment_documents_investment_id ON public.investment_documents(investment_id);
CREATE INDEX idx_investment_documents_user_id ON public.investment_documents(user_id);
CREATE INDEX idx_investment_documents_document_type ON public.investment_documents(document_type);

-- Enable RLS
ALTER TABLE public.investment_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own investment documents"
  ON public.investment_documents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all investment documents"
  ON public.investment_documents
  FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Create storage bucket for investment documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'investment-documents',
  'investment-documents',
  false,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can view their own investment documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'investment-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Service role can manage investment documents"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'investment-documents' 
    AND (auth.jwt() ->> 'role'::text) = 'service_role'::text
  );