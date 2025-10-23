-- Enable RLS and add policies for property_images to fix insert RLS violations

-- Enable Row Level Security on property_images (safe if already enabled)
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- Allow property owners to insert images for their properties
CREATE POLICY "Owners can insert property images"
ON public.property_images
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_images.property_id
      AND p.owner_id = auth.uid()
  )
);

-- Allow property owners to update their images
CREATE POLICY "Owners can update property images"
ON public.property_images
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_images.property_id
      AND p.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_images.property_id
      AND p.owner_id = auth.uid()
  )
);

-- Allow property owners to delete their images
CREATE POLICY "Owners can delete property images"
ON public.property_images
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_images.property_id
      AND p.owner_id = auth.uid()
  )
);

-- Allow public read of images for active listings, and owners can view all their images
CREATE POLICY "Public can view active property images; owners can view theirs"
ON public.property_images
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_images.property_id
      AND (
        p.listing_status = 'active'
        OR p.owner_id = auth.uid()
      )
  )
);
