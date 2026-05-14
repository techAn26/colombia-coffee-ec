"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type OrderStatus = "pending" | "preparing" | "shipped" | "completed" | "cancelled";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "受注",
  preparing: "発送準備中",
  shipped: "発送済み",
  completed: "完了",
  cancelled: "キャンセル",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

/**
 * ステータスの次の遷移先を取得
 */
export function getNextStatuses(current: OrderStatus): OrderStatus[] {
  switch (current) {
    case "pending":
      return ["preparing", "cancelled"];
    case "preparing":
      return ["shipped"];
    case "shipped":
      return ["completed"];
    case "completed":
    case "cancelled":
      return [];
    default:
      return [];
  }
}

export type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;
  total: number;
  shipping_name: string;
  shipping_postal_code: string;
  shipping_address: string;
  shipping_phone: string;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  product_name: string;
  variant_label: string;
  price: number;
  quantity: number;
};

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

/**
 * ユーザーの注文一覧を取得
 */
export async function getUserOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Order[];
}

/**
 * 注文詳細を取得（明細付き）
 */
export async function getOrder(id: string): Promise<OrderWithItems | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as OrderWithItems;
}

/**
 * 全注文を取得（管理者用）
 */
export async function getAllOrders(statusFilter?: string): Promise<Order[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Order[];
}

/**
 * 注文ステータスを更新（管理者用 Server Action）
 */
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) throw error;

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/mypage/orders");
}
