-- ============================================
-- RLS Policies
-- ============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.shipping_addresses enable row level security;

-- Helper function: check if user is admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================
-- profiles
-- ============================================
create policy "profiles: users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: users can update own profile (except role)"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- ============================================
-- categories
-- ============================================
create policy "categories: anyone can view"
  on public.categories for select
  using (true);

create policy "categories: admin can insert"
  on public.categories for insert
  with check (public.is_admin());

create policy "categories: admin can update"
  on public.categories for update
  using (public.is_admin());

create policy "categories: admin can delete"
  on public.categories for delete
  using (public.is_admin());

-- ============================================
-- products
-- ============================================
create policy "products: anyone can view published"
  on public.products for select
  using (is_published = true or public.is_admin());

create policy "products: admin can insert"
  on public.products for insert
  with check (public.is_admin());

create policy "products: admin can update"
  on public.products for update
  using (public.is_admin());

create policy "products: admin can delete"
  on public.products for delete
  using (public.is_admin());

-- ============================================
-- product_variants
-- ============================================
create policy "product_variants: anyone can view (if product is published)"
  on public.product_variants for select
  using (
    exists (
      select 1 from public.products
      where products.id = product_variants.product_id
      and (products.is_published = true or public.is_admin())
    )
  );

create policy "product_variants: admin can insert"
  on public.product_variants for insert
  with check (public.is_admin());

create policy "product_variants: admin can update"
  on public.product_variants for update
  using (public.is_admin());

create policy "product_variants: admin can delete"
  on public.product_variants for delete
  using (public.is_admin());

-- ============================================
-- cart_items
-- ============================================
create policy "cart_items: users can view own"
  on public.cart_items for select
  using (auth.uid() = user_id);

create policy "cart_items: users can insert own"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

create policy "cart_items: users can update own"
  on public.cart_items for update
  using (auth.uid() = user_id);

create policy "cart_items: users can delete own"
  on public.cart_items for delete
  using (auth.uid() = user_id);

-- ============================================
-- orders
-- ============================================
create policy "orders: users can view own, admin can view all"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

-- INSERT is handled server-side (Stripe Webhook) using service_role key
-- No RLS insert policy for regular users

create policy "orders: admin can update status"
  on public.orders for update
  using (public.is_admin());

-- ============================================
-- order_items
-- ============================================
create policy "order_items: users can view own orders, admin can view all"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or public.is_admin())
    )
  );

-- INSERT is handled server-side (Stripe Webhook) using service_role key

-- ============================================
-- reviews
-- ============================================
create policy "reviews: anyone can view"
  on public.reviews for select
  using (true);

create policy "reviews: users can insert for purchased products"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.order_items oi
      join public.orders o on o.id = oi.order_id
      join public.product_variants pv on pv.id = oi.variant_id
      where o.user_id = auth.uid()
      and pv.product_id = reviews.product_id
      and o.status in ('shipped', 'completed')
    )
  );

create policy "reviews: users can update own"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "reviews: users can delete own"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- ============================================
-- shipping_addresses
-- ============================================
create policy "shipping_addresses: users can view own"
  on public.shipping_addresses for select
  using (auth.uid() = user_id);

create policy "shipping_addresses: users can insert own"
  on public.shipping_addresses for insert
  with check (auth.uid() = user_id);

create policy "shipping_addresses: users can update own"
  on public.shipping_addresses for update
  using (auth.uid() = user_id);

create policy "shipping_addresses: users can delete own"
  on public.shipping_addresses for delete
  using (auth.uid() = user_id);
