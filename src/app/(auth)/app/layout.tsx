import LoadingPage from "@/components/ui/LoadingPage";
import AppShell from "@/components/ui/navigation/AppShell";
import { ReactNode, Suspense } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingPage />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
