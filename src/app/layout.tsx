import type { Metadata } from "next";
import "./globals.css";
import MainTopNav from "@/components/ui/MainTopNav";

export const metadata: Metadata = {
  title: "ERP GI Administración",
  description: "",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="corporate">
      <body>
        <div className="h-screen flex flex-col overflow-hidden">
          <MainTopNav />
          <main className="flex-1 flex flex-col min-h-0 w-min-0 rounded">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
