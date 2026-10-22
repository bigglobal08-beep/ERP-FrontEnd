"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type ButonVariants = "primary" | "secondary" | "warning" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButonVariants;
  size?: ButtonSize;
}

export default function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  size = "sm",
}: ButtonProps) {
  const classVariant: Record<ButonVariants, string> = {
    primary: "bg-black text-white",
    secondary: "",
    warning: "",
    danger: "",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "p-1 text-sm",
    md: "p-2 text-base font-semibold",
    lg: "p-2.5 text-lg font-semibold",
  };

  return (
    <button
      type={type}
      className={`${classVariant[variant]} ${sizes[size]} rounded-lg font-light active:opacity-85 transition-colors duration-200 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
