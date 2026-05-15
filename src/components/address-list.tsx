"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type ShippingAddress,
} from "@/lib/address-actions";

interface AddressListProps {
  addresses: ShippingAddress[];
}

export function AddressList({ addresses }: AddressListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {addresses.map((addr) =>
        editingId === addr.id ? (
          <AddressForm
            key={addr.id}
            defaultValues={addr}
            onSubmit={async (data) => {
              await updateAddress(addr.id, data);
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <AddressCard
            key={addr.id}
            address={addr}
            onEdit={() => setEditingId(addr.id)}
            onDelete={() => deleteAddress(addr.id)}
            onSetDefault={() => setDefaultAddress(addr.id)}
          />
        )
      )}

      {isAdding ? (
        <AddressForm
          onSubmit={async (data) => {
            await addAddress(data);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <Button variant="outline" onClick={() => setIsAdding(true)}>
          + 配送先を追加
        </Button>
      )}
    </div>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: ShippingAddress;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>
            {address.label}
            {address.is_default && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                デフォルト
              </span>
            )}
          </span>
          <div className="flex gap-2">
            {!address.is_default && (
              <Button variant="ghost" size="xs" onClick={onSetDefault}>
                デフォルトに設定
              </Button>
            )}
            <Button variant="ghost" size="xs" onClick={onEdit}>
              編集
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={onDelete}
              className="text-destructive"
            >
              削除
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <p>{address.name}</p>
        <p>〒{address.postal_code}</p>
        <p>{address.address}</p>
        <p>{address.phone}</p>
      </CardContent>
    </Card>
  );
}

function AddressForm({
  defaultValues,
  onSubmit,
  onCancel,
}: {
  defaultValues?: Omit<ShippingAddress, "id" | "is_default">;
  onSubmit: (data: Omit<ShippingAddress, "id" | "is_default">) => Promise<void>;
  onCancel: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      await onSubmit({
        label: fd.get("label") as string,
        name: fd.get("name") as string,
        postal_code: fd.get("postal_code") as string,
        address: fd.get("address") as string,
        phone: fd.get("phone") as string,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="label">ラベル *</Label>
              <Input
                id="label"
                name="label"
                required
                placeholder="自宅"
                defaultValue={defaultValues?.label}
              />
            </div>
            <div>
              <Label htmlFor="addr_name">氏名 *</Label>
              <Input
                id="addr_name"
                name="name"
                required
                defaultValue={defaultValues?.name}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="postal_code">郵便番号 *</Label>
              <Input
                id="postal_code"
                name="postal_code"
                required
                placeholder="123-4567"
                defaultValue={defaultValues?.postal_code}
              />
            </div>
            <div>
              <Label htmlFor="phone">電話番号 *</Label>
              <Input
                id="phone"
                name="phone"
                required
                placeholder="090-1234-5678"
                defaultValue={defaultValues?.phone}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">住所 *</Label>
            <Input
              id="address"
              name="address"
              required
              defaultValue={defaultValues?.address}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
