import { Montserrat } from "next/font/google";
import type { ReactNode } from "react";

const montserrat = Montserrat({ subsets: ["latin"], display: "swap", weight: "800" });

export default function PageTitle({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1
        style={montserrat.style}
        className="min-w-0 text-3xl break-words uppercase md:text-4xl"
      >
        {title}
      </h1>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}
