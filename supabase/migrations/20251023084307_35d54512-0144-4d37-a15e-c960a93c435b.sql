-- Storage RLS for property-images: allow owners to upload into their property folder
-- Safe-guarded with IF NOT EXISTS wrappers

-- INSERT policy: owners can upload files to path {property_id}/...
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Owners can upload property images to their folder'
  ) THEN
    CREATE POLICY "Owners can upload property images to their folder"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'property-images'
      AND EXISTS (
        SELECT 1 FROM public.properties p
        WHERE p.id::text = (storage.foldername(name))[1]
          AND p.owner_id = auth.uid()
      )
    );
  END IF;
END $$;

-- UPDATE policy: owners can modify files in their property folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Owners can update property images in their folder'
  ) THEN
    CREATE POLICY "Owners can update property images in their folder"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'property-images'
      AND EXISTS (
        SELECT 1 FROM public.properties p
        WHERE p.id::text = (storage.foldername(name))[1]
          AND p.owner_id = auth.uid()
      )
    )
    WITH CHECK (
      bucket_id = 'property-images'
      AND EXISTS (
        SELECT 1 FROM public.properties p
        WHERE p.id::text = (storage.foldername(name))[1]
          AND p.owner_id = auth.uid()
      )
    );
  END IF;
END $$;

-- DELETE policy: owners can delete files in their property folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Owners can delete property images in their folder'
  ) THEN
    CREATE POLICY "Owners can delete property images in their folder"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'property-images'
      AND EXISTS (
        SELECT 1 FROM public.properties p
        WHERE p.id::text = (storage.foldername(name))[1]
          AND p.owner_id = auth.uid()
      )
    );
  END IF;
END $$;

-- SELECT policy (optional for public buckets): allow public read, plus owners always
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Public can view property images or owners access'
  ) THEN
    CREATE POLICY "Public can view property images or owners access"
    ON storage.objects
    FOR SELECT
    USING (
      bucket_id = 'property-images'
      AND (
        -- Public buckets are accessible via the storage API without JWT,
        -- but this keeps Postgres access consistent if queried directly.
        TRUE
        OR EXISTS (
          SELECT 1 FROM public.properties p
          WHERE p.id::text = (storage.foldername(name))[1]
            AND p.owner_id = auth.uid()
        )
      )
    );
  END IF;
END $$;