"use client";

import type { CSSProperties, ReactNode } from "react";

interface FormGroupProps {
  children: ReactNode;
  className?: string;
  col?: number;
  colSm?: number;
  colMd?: number;
  colLg?: number;
  colXl?: number;
  colXxl?: number;
}

type GridStyles = CSSProperties & {
  "--cols": number;
  "--cols-sm": number;
  "--cols-md": number;
  "--cols-lg": number;
  "--cols-xl": number;
  "--cols-2xl": number;
};

export default function FormGrid({
  children,
  className = "",
  col = 1,
  colSm,
  colMd,
  colLg,
  colXl,
  colXxl,
}: FormGroupProps) {
  const styles = {
    "--cols": col,
    "--cols-sm": colSm ?? col,
    "--cols-md": colMd ?? colSm ?? col,
    "--cols-lg": colLg ?? colMd ?? colSm ?? col,
    "--cols-xl": colXl ?? colLg ?? colMd ?? colSm ?? col,
    "--cols-2xl": colXxl ?? colXl ?? colLg ?? colMd ?? colSm ?? col,
  } as GridStyles;

  return (
    <div
      style={styles}
      className={`
        grid w-full gap-3
        grid-cols-[repeat(var(--cols),minmax(0,1fr))]
        sm:grid-cols-[repeat(var(--cols-sm),minmax(0,1fr))]
        md:grid-cols-[repeat(var(--cols-md),minmax(0,1fr))]
        lg:grid-cols-[repeat(var(--cols-lg),minmax(0,1fr))]
        xl:grid-cols-[repeat(var(--cols-xl),minmax(0,1fr))]
        2xl:grid-cols-[repeat(var(--cols-2xl),minmax(0,1fr))]
        ${className}
      `}
    >
      {children}
    </div>
  );
}
