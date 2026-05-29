"use client";
import { TopBarGlobal } from "@/components/shell/TopBarGlobal";
import {
  Sparkles,
  ShoppingCart,
  Package,
  Boxes,
  LayoutDashboard,
  ReceiptText,
  Settings,
  LucideIcon,
} from "lucide-react";

export type ComingSoonIcon =
  | "sparkles"
  | "kasir"
  | "produk"
  | "stok"
  | "dashboard"
  | "riwayat"
  | "pengaturan";

const ICONS: Record<ComingSoonIcon, LucideIcon> = {
  sparkles: Sparkles,
  kasir: ShoppingCart,
  produk: Package,
  stok: Boxes,
  dashboard: LayoutDashboard,
  riwayat: ReceiptText,
  pengaturan: Settings,
};

type Props = {
  title: string;
  subtitle?: string;
  icon?: ComingSoonIcon;
  description?: string;
};

export function ComingSoon({
  title,
  subtitle,
  icon = "sparkles",
  description = "Bagian ini sedang dibangun. Akan tersedia segera.",
}: Props) {
  const Icon = ICONS[icon];
  return (
    <>
      <TopBarGlobal title={title} subtitle={subtitle} />
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold tracking-tight">Segera hadir</p>
          <p className="text-sm text-muted-foreground mt-1.5">{description}</p>
        </div>
      </div>
    </>
  );
}
