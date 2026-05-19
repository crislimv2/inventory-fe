export const formatRp = (value: number | null | undefined): string => {
  const n = Number(value || 0);
  return `Rp ${n.toLocaleString("id-ID")}`;
};

export const formatRpShort = (value: number | null | undefined): string => {
  const n = Number(value || 0);
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(1).replace(/\.0$/, "")}rb`;
  return `Rp ${n}`;
};

export const parseRp = (value: string | undefined): number => {
  if (!value) return 0;
  return Number(value.replace(/[^\d]/g, "")) || 0;
};

export const formatTime = (date: Date = new Date()): string =>
  date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

export const formatDate = (date: Date = new Date()): string =>
  date.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
