CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  email text,
  phone text,
  avatar_url text,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can read their profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Members can update their profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'customer',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can read their own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NULLIF(NEW.raw_user_meta_data->>'name', ''), split_part(COALESCE(NEW.email, ''), '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();

CREATE TABLE public.store_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  division text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '/images/store-timber.jpg',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_categories TO authenticated;
GRANT ALL ON public.store_categories TO service_role;
ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active categories are visible publicly" ON public.store_categories FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage categories" ON public.store_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.store_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text NOT NULL UNIQUE,
  category_id uuid NOT NULL REFERENCES public.store_categories(id),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '/images/store-timber.jpg',
  image_urls text[] NOT NULL DEFAULT '{}'::text[],
  price numeric(12,2) NOT NULL CHECK (price > 0),
  discount_price numeric(12,2) CHECK (discount_price IS NULL OR (discount_price > 0 AND discount_price < price)),
  stock_quantity integer CHECK (stock_quantity IS NULL OR stock_quantity >= 0),
  is_available boolean NOT NULL DEFAULT true,
  unit text NOT NULL DEFAULT 'piece',
  size text,
  material text,
  color text,
  brand text,
  variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_products TO authenticated;
GRANT ALL ON public.store_products TO service_role;
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Available products are visible publicly" ON public.store_products FOR SELECT TO anon, authenticated USING (is_available OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products" ON public.store_products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX store_products_category_idx ON public.store_products(category_id);
CREATE INDEX store_products_featured_idx ON public.store_products(is_featured, created_at DESC);

CREATE TABLE public.store_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code text NOT NULL UNIQUE,
  idempotency_key uuid NOT NULL UNIQUE,
  customer_name text NOT NULL,
  phone text NOT NULL,
  fulfillment text NOT NULL CHECK (fulfillment IN ('delivery', 'collection')),
  delivery_address text,
  notes text NOT NULL DEFAULT '',
  items jsonb NOT NULL,
  subtotal numeric(12,2) NOT NULL CHECK (subtotal >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((fulfillment = 'collection') OR (delivery_address IS NOT NULL AND length(trim(delivery_address)) > 0))
);
GRANT SELECT, UPDATE ON public.store_enquiries TO authenticated;
GRANT ALL ON public.store_enquiries TO service_role;
ALTER TABLE public.store_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read enquiries" ON public.store_enquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update enquiries" ON public.store_enquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view product images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'store-products');
CREATE POLICY "Admins upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'store-products' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update product images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'store-products' AND public.has_role(auth.uid(), 'admin')) WITH CHECK (bucket_id = 'store-products' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'store-products' AND public.has_role(auth.uid(), 'admin'));

INSERT INTO public.store_categories (id, name, slug, division, description, image_url, display_order) VALUES
  ('10000000-0000-4000-8000-000000000001', 'Timber and plywood', 'timber', 'Timber', 'Timber sections and plywood sheets for building and interior projects.', '/images/store-timber.jpg', 1),
  ('10000000-0000-4000-8000-000000000002', 'Doors and wooden frames', 'doors', 'Timber', 'Wooden doors and frames for your project.', '/images/store-doors.jpg', 2),
  ('10000000-0000-4000-8000-000000000003', 'Paints', 'paints', 'Hardware', 'Paint products and finishing supplies.', '/images/store-paints-tools.jpg', 3),
  ('10000000-0000-4000-8000-000000000004', 'Hand tools', 'hand-tools', 'Hardware', 'Practical hand tools for home and site work.', '/images/store-paints-tools.jpg', 4),
  ('10000000-0000-4000-8000-000000000005', 'Nails and screws', 'nails-screws', 'Hardware', 'Fixings and fasteners for woodworking and construction.', '/images/store-hardware.jpg', 5),
  ('10000000-0000-4000-8000-000000000006', 'Locks and hinges', 'locks-hinges', 'Hardware', 'Door locks, hinges and related fittings.', '/images/store-hardware.jpg', 6),
  ('10000000-0000-4000-8000-000000000007', 'General hardware', 'general-hardware', 'Hardware', 'Everyday fittings and general building supplies.', '/images/store-hardware.jpg', 7);

INSERT INTO public.store_products (id, sku, category_id, name, description, image_url, price, stock_quantity, is_available, unit, size, material, is_demo, is_featured) VALUES
  ('20000000-0000-4000-8000-000000000001', 'DEMO-TIM-001', '10000000-0000-4000-8000-000000000001', 'Demo timber section', 'Sample timber listing. Confirm the wood type, section size and current price with the shop.', '/images/store-timber.jpg', 1850.00, NULL, true, 'piece', 'Sample size', 'Sample wood', true, true),
  ('20000000-0000-4000-8000-000000000002', 'DEMO-PLY-001', '10000000-0000-4000-8000-000000000001', 'Demo plywood sheet', 'Sample plywood listing. Confirm grade, thickness, dimensions and current price with the shop.', '/images/store-timber.jpg', 1250.00, NULL, true, 'sheet', 'Sample size', 'Plywood', true, true),
  ('20000000-0000-4000-8000-000000000003', 'DEMO-PLY-002', '10000000-0000-4000-8000-000000000001', 'Demo marine plywood', 'Sample listing only. Confirm specification and availability with the shop.', '/images/store-timber.jpg', 2450.00, NULL, true, 'sheet', 'Sample size', 'Plywood', true, false),
  ('20000000-0000-4000-8000-000000000004', 'DEMO-DOO-001', '10000000-0000-4000-8000-000000000002', 'Demo panel door', 'Sample wooden door listing. Confirm dimensions, finish and price with the shop.', '/images/store-doors.jpg', 4800.00, NULL, true, 'piece', 'Sample size', 'Wood', true, true),
  ('20000000-0000-4000-8000-000000000005', 'DEMO-FRM-001', '10000000-0000-4000-8000-000000000002', 'Demo wooden frame', 'Sample frame listing. Confirm measurements and material before ordering.', '/images/store-doors.jpg', 2800.00, NULL, true, 'set', 'Sample size', 'Wood', true, false),
  ('20000000-0000-4000-8000-000000000006', 'DEMO-PNT-001', '10000000-0000-4000-8000-000000000003', 'Demo enamel paint', 'Sample paint listing. Confirm brand, colour and can size with the shop.', '/images/store-paints-tools.jpg', 650.00, NULL, true, 'litre', 'Sample size', NULL, true, true),
  ('20000000-0000-4000-8000-000000000007', 'DEMO-TOO-001', '10000000-0000-4000-8000-000000000004', 'Demo claw hammer', 'Sample hand tool listing. Confirm brand and specification with the shop.', '/images/store-paints-tools.jpg', 380.00, NULL, true, 'piece', NULL, 'Steel', true, false),
  ('20000000-0000-4000-8000-000000000008', 'DEMO-FIX-001', '10000000-0000-4000-8000-000000000005', 'Demo wood screws pack', 'Sample fastener listing. Confirm length, finish and pack quantity with the shop.', '/images/store-hardware.jpg', 120.00, NULL, true, 'pack', 'Sample size', 'Steel', true, false),
  ('20000000-0000-4000-8000-000000000009', 'DEMO-LCK-001', '10000000-0000-4000-8000-000000000006', 'Demo mortise lock', 'Sample lock listing. Confirm model, finish and included fittings with the shop.', '/images/store-hardware.jpg', 890.00, NULL, true, 'piece', NULL, 'Metal', true, true),
  ('20000000-0000-4000-8000-000000000010', 'DEMO-HNG-001', '10000000-0000-4000-8000-000000000006', 'Demo butt hinge pair', 'Sample hinge listing. Confirm size, finish and pack contents with the shop.', '/images/store-hardware.jpg', 220.00, NULL, true, 'pair', 'Sample size', 'Steel', true, false),
  ('20000000-0000-4000-8000-000000000011', 'DEMO-HDW-001', '10000000-0000-4000-8000-000000000007', 'Demo general fitting', 'Sample hardware listing. Confirm the item, specification and price with the shop.', '/images/store-hardware.jpg', 150.00, NULL, true, 'piece', NULL, 'Metal', true, false);
