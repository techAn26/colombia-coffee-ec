/**
 * 注文ステータス関連のユーティリティ（純粋関数）
 * テスト可能にするため、Server Actions（orders.ts）から分離
 */

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
