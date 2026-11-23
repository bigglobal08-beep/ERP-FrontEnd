"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

// Páginas a mostrar: primera, última y las vecinas de la actual
function visiblePages(page: number, pages: number) {
  const set = new Set([1, pages, page - 1, page, page + 1]);
  return [...set].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
}

export default function Pagination({
  page,
  limit,
  total,
}: {
  page: number;
  limit: number;
  total: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pages = Math.max(Math.ceil(total / limit), 1);
  if (pages <= 1) return null;

  const href = (target: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(target));
    return `${pathname}?${params.toString()}`;
  };

  const numbers = visiblePages(page, pages);

  return (
    <nav aria-label="Paginación" className="mt-6 flex flex-wrap justify-center gap-1">
      {page > 1 ? (
        <Link href={href(page - 1)} className="btn btn-sm btn-square btn-ghost" aria-label="Página anterior">
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className="btn btn-sm btn-square btn-ghost btn-disabled" aria-hidden="true">
          <ChevronLeft className="size-4" />
        </span>
      )}
      {numbers.map((number, index) => (
        <span key={number} className="flex gap-1">
          {index > 0 && number - numbers[index - 1] > 1 && (
            <span className="btn btn-sm btn-square btn-ghost btn-disabled">…</span>
          )}
          <Link
            href={href(number)}
            aria-current={number === page ? "page" : undefined}
            className={`btn btn-sm btn-square ${number === page ? "btn-primary" : "btn-ghost"}`}
          >
            {number}
          </Link>
        </span>
      ))}
      {page < pages ? (
        <Link href={href(page + 1)} className="btn btn-sm btn-square btn-ghost" aria-label="Página siguiente">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className="btn btn-sm btn-square btn-ghost btn-disabled" aria-hidden="true">
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
