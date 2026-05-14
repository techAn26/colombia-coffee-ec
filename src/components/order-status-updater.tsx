"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  updateOrderStatus,
  getNextStatuses,
  STATUS_LABELS,
  type OrderStatus,
} from "@/lib/orders";

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: OrderStatusUpdaterProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const nextStatuses = getNextStatuses(currentStatus);

  if (nextStatuses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        この注文のステータスは変更できません。
      </p>
    );
  }

  const handleUpdate = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">ステータスを変更:</p>
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <Button
            key={status}
            variant={status === "cancelled" ? "destructive" : "outline"}
            size="sm"
            onClick={() => handleUpdate(status)}
            disabled={isUpdating}
          >
            {isUpdating ? "更新中..." : `→ ${STATUS_LABELS[status]}`}
          </Button>
        ))}
      </div>
    </div>
  );
}
