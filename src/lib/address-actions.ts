"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ShippingAddress = {
  id: string;
  label: string;
  name: string;
  postal_code: string;
  address: string;
  phone: string;
  is_default: boolean;
};

export async function getAddresses(): Promise<ShippingAddress[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("shipping_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ShippingAddress[];
}

export async function addAddress(data: Omit<ShippingAddress, "id" | "is_default">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  // 最初の配送先はデフォルトにする
  const { count } = await supabase
    .from("shipping_addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { error } = await supabase.from("shipping_addresses").insert({
    user_id: user.id,
    ...data,
    is_default: count === 0,
  });

  if (error) throw error;
  revalidatePath("/mypage/addresses");
}

export async function updateAddress(
  addressId: string,
  data: Omit<ShippingAddress, "id" | "is_default">
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  const { error } = await supabase
    .from("shipping_addresses")
    .update(data)
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/mypage/addresses");
}

export async function deleteAddress(addressId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  const { error } = await supabase
    .from("shipping_addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/mypage/addresses");
}

export async function setDefaultAddress(addressId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  // 全てのデフォルトを解除
  await supabase
    .from("shipping_addresses")
    .update({ is_default: false })
    .eq("user_id", user.id);

  // 指定のアドレスをデフォルトに
  const { error } = await supabase
    .from("shipping_addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/mypage/addresses");
}
