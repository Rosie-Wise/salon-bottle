-- Salon Bottle initial schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  salon_name TEXT,
  email TEXT,
  phone TEXT,
  business_location TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, salon_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'given_name'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'family_name'),
    NEW.raw_user_meta_data->>'salon_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

-- Logos
CREATE TABLE public.logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  session_id TEXT,
  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX logos_user_id_idx ON public.logos (user_id);
CREATE INDEX logos_session_id_idx ON public.logos (session_id);

-- Designs
CREATE TABLE public.designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  logo_id UUID REFERENCES public.logos (id) ON DELETE SET NULL,
  session_id TEXT,
  product_type TEXT,
  design_style TEXT,
  current_version INT NOT NULL DEFAULT 1,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  approved_version INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX designs_user_id_idx ON public.designs (user_id);

-- Design versions
CREATE TABLE public.design_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES public.designs (id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  preview_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (design_id, version_number)
);

-- Orders
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  design_id UUID REFERENCES public.designs (id) ON DELETE SET NULL,
  approved_version INT,
  shampoo_qty INT NOT NULL DEFAULT 0,
  conditioner_qty INT NOT NULL DEFAULT 0,
  total_qty INT NOT NULL DEFAULT 0,
  customer_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  price_per_bottle NUMERIC,
  total_value NUMERIC,
  submission_key TEXT UNIQUE,
  excel_row_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX orders_user_id_idx ON public.orders (user_id);
CREATE INDEX orders_status_idx ON public.orders (status);

-- Excel sync jobs
CREATE TABLE public.excel_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempt_count INT NOT NULL DEFAULT 0,
  last_error TEXT,
  last_attempted TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX excel_sync_jobs_status_idx ON public.excel_sync_jobs (status);

-- Site settings
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Updated_at trigger for designs and orders
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER designs_updated_at
  BEFORE UPDATE ON public.designs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Storage buckets (private)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('logos', 'logos', false),
  ('stickers', 'stickers', false)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excel_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

-- Logos
CREATE POLICY logos_select ON public.logos
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY logos_insert ON public.logos
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL OR public.is_admin());

CREATE POLICY logos_update ON public.logos
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY logos_delete ON public.logos
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- Designs
CREATE POLICY designs_select ON public.designs
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY designs_insert ON public.designs
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL OR public.is_admin());

CREATE POLICY designs_update ON public.designs
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY designs_delete ON public.designs
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- Design versions (via design ownership)
CREATE POLICY design_versions_select ON public.design_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.designs d
      WHERE d.id = design_id AND (d.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY design_versions_insert ON public.design_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.designs d
      WHERE d.id = design_id AND (d.user_id = auth.uid() OR public.is_admin())
    )
  );

-- Orders
CREATE POLICY orders_select ON public.orders
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY orders_insert ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY orders_update ON public.orders
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

-- Excel sync jobs (admin + order owner read)
CREATE POLICY excel_sync_jobs_select ON public.excel_sync_jobs
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY excel_sync_jobs_admin_write ON public.excel_sync_jobs
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY excel_sync_jobs_insert_service ON public.excel_sync_jobs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
    OR public.is_admin()
  );

-- Site settings: public read for app config keys, admin write
CREATE POLICY site_settings_select ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY site_settings_admin_write ON public.site_settings
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Storage policies
CREATE POLICY storage_logos_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'logos'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
  );

CREATE POLICY storage_logos_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'logos'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
  );

CREATE POLICY storage_stickers_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'stickers'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
  );

CREATE POLICY storage_stickers_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'stickers'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
  );
