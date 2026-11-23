import type { Metadata } from "next";
import "./globals.css";
import MainTopNav from "@/components/ui/MainTopNav";
import ModalProvider from "@/components/ui/modal/ModalProvider";
import AppToaster from "@/components/ui/AppToaster";

export const metadata: Metadata = {
  title: "ERP GI Administración",
  description: "",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="corporate" suppressHydrationWarning>
      <body>
        <div className="h-screen flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0 w-min-0 rounded">
            {children}
          </div>
        </div>
        <ModalProvider />
        <AppToaster />
      </body>
    </html>
  );
}
