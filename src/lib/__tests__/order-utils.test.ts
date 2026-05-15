import { describe, it, expect } from "vitest";
import {
  getNextStatuses,
  STATUS_LABELS,
  STATUS_COLORS,
  type OrderStatus,
} from "@/lib/order-utils";

describe("getNextStatuses", () => {
  it("pendingからは preparing と cancelled に遷移可能", () => {
    expect(getNextStatuses("pending")).toEqual(["preparing", "cancelled"]);
  });

  it("preparingからは shipped に遷移可能", () => {
    expect(getNextStatuses("preparing")).toEqual(["shipped"]);
  });

  it("shippedからは completed に遷移可能", () => {
    expect(getNextStatuses("shipped")).toEqual(["completed"]);
  });

  it("completedからは遷移不可", () => {
    expect(getNextStatuses("completed")).toEqual([]);
  });

  it("cancelledからは遷移不可", () => {
    expect(getNextStatuses("cancelled")).toEqual([]);
  });

  it("不明なステータスからは遷移不可", () => {
    expect(getNextStatuses("unknown" as OrderStatus)).toEqual([]);
  });
});

describe("STATUS_LABELS", () => {
  it("全5ステータスに日本語ラベルが定義されている", () => {
    expect(STATUS_LABELS.pending).toBe("受注");
    expect(STATUS_LABELS.preparing).toBe("発送準備中");
    expect(STATUS_LABELS.shipped).toBe("発送済み");
    expect(STATUS_LABELS.completed).toBe("完了");
    expect(STATUS_LABELS.cancelled).toBe("キャンセル");
  });
});

describe("STATUS_COLORS", () => {
  it("全5ステータスにCSSクラスが定義されている", () => {
    const statuses: OrderStatus[] = [
      "pending",
      "preparing",
      "shipped",
      "completed",
      "cancelled",
    ];

    statuses.forEach((status) => {
      expect(STATUS_COLORS[status]).toBeDefined();
      expect(STATUS_COLORS[status]).toContain("bg-");
      expect(STATUS_COLORS[status]).toContain("text-");
    });
  });
});
