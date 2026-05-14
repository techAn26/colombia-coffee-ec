-- 在庫を減算するRPC関数（楽観的ロック）
create or replace function public.decrement_stock(
  p_variant_id uuid,
  p_quantity int
)
returns void
language plpgsql
security definer
as $$
begin
  update product_variants
  set stock = stock - p_quantity
  where id = p_variant_id
    and stock >= p_quantity;

  if not found then
    raise exception 'Insufficient stock for variant %', p_variant_id;
  end if;
end;
$$;
