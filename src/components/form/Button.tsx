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
    sm: "p-1",
    md: "p-2",
    lg: "p-2.5",
  };

  return (
    <button
      type={type}
      className={`${classVariant[variant]} ${sizes[size]} rounded-lg font-light active:opacity-90 transition-colors duration-200 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
