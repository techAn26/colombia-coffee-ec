-- ============================================
-- Colombia Coffee EC - Initial Schema
-- ============================================

-- 1. profiles（ユーザー情報）
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. categories（カテゴリ）
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 3. products（商品）
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id),
  name text not null,
  description text not null,
  origin text not null,
  farm_name text,
  farm_story text,
  roast_level text not null check (roast_level in ('light', 'medium', 'dark')),
  process text,
  altitude text,
  flavor_notes text[],
  image_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. product_variants（商品バリエーション）
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  weight_g int not null,
  price int not null,
  stock int not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, weight_g)
);

-- 5. cart_items（カート）
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, variant_id)
);

-- 6. orders（注文）
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  order_number text not null unique,
  status text not null default 'pending' check (status in ('pending', 'preparing', 'shipped', 'completed', 'cancelled')),
  total int not null,
  shipping_name text not null,
  shipping_postal_code text not null,
  shipping_address text not null,
  shipping_phone text not null,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. order_items（注文明細）
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id),
  product_name text not null,
  variant_label text not null,
  price int not null,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now()
);

-- 8. reviews（レビュー）
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- 9. shipping_addresses（配送先）
create table public.shipping_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  name text not null,
  postal_code text not null,
  address text not null,
  phone text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- Indexes
-- ============================================
create index idx_products_category_id on public.products(category_id);
create index idx_products_roast_level on public.products(roast_level);
create index idx_products_origin on public.products(origin);
create index idx_product_variants_product_id on public.product_variants(product_id);
create index idx_cart_items_user_id on public.cart_items(user_id);
create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_order_items_order_id on public.order_items(order_id);
create index idx_reviews_product_id on public.reviews(product_id);
create index idx_shipping_addresses_user_id on public.shipping_addresses(user_id);

-- ============================================
-- Auto-create profile on signup (trigger)
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'ユーザー'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- Updated_at auto-update trigger
-- ============================================
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();
create trigger set_updated_at before update on public.products
  for each row execute procedure public.update_updated_at();
create trigger set_updated_at before update on public.product_variants
  for each row execute procedure public.update_updated_at();
create trigger set_updated_at before update on public.cart_items
  for each row execute procedure public.update_updated_at();
create trigger set_updated_at before update on public.orders
  for each row execute procedure public.update_updated_at();
create trigger set_updated_at before update on public.reviews
  for each row execute procedure public.update_updated_at();
create trigger set_updated_at before update on public.shipping_addresses
  for each row execute procedure public.update_updated_at();

-- ============================================
-- Initial data: default category
-- ============================================
insert into public.categories (name, slug, sort_order)
values ('コーヒー豆', 'coffee-beans', 1);
