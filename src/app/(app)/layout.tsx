import { LeftRail } from "@/components/shell/LeftRail";
import { PosBoot } from "@/components/shell/PosBoot";

export default function AppShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <PosBoot />
      <LeftRail />
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
