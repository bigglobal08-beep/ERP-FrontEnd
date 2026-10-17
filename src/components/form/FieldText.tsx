import type { InputHTMLAttributes } from "react";
import { useId } from "react";

interface FieldTextProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  type?: "text" | "email" | "password";
  name: string;
  direction?: "block" | "inline";
}

export default function FieldText({
  label,
  type = "text",
  className = "",
  name,
  id,
  direction = "block",
  ...props
}: FieldTextProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const classDirection =
    direction === "block" || !label
      ? "flex flex-col gap-1.5"
      : "grid grid-cols-[var(--field-label-width,100px)_minmax(0,1fr)] gap-2 items-center";

  return (
    <div className={`${classDirection} min-w-0 w-full`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-slate-700"
        >
          {label}
        </label>
      )}

      <input
        {...props}
        id={inputId}
        name={name}
        type={type}
        autoComplete="off"
        className={`
          w-full rounded-lg border border-slate-300
          bg-white px-3 py-1.5
          text-sm text-slate-800
          placeholder:text-slate-400

          outline-none
          transition-all duration-200 ease-in-out

          hover:border-slate-400
          hover:shadow-sm

          focus:border-gray-500
          focus:ring-4
          focus:ring-gray-500/15

          active:border-blue-600

          disabled:cursor-not-allowed
          disabled:bg-slate-100
          disabled:text-slate-400
          disabled:opacity-70
        
        ${type === "password" && "text-center"}
          ${className}
        `}
      />
    </div>
  );
}
