-- Create table for storing lead information before download
CREATE TABLE public.download_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  business_name TEXT NOT NULL,
  location TEXT NOT NULL,
  download_format TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.download_leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can submit lead info"
ON public.download_leads
FOR INSERT
WITH CHECK (true);

-- Only authenticated users or service role can read
CREATE POLICY "Service role can read leads"
ON public.download_leads
FOR SELECT
USING (false);