import { CircleX, Inbox, Lock } from "lucide-react";
import type { ReactNode } from "react";

const variants = {
  empty: { icon: Inbox, className: "text-base-content/40" },
  error: { icon: CircleX, className: "text-error" },
  forbidden: { icon: Lock, className: "text-warning" },
};

type StateMessageProps = {
  variant?: keyof typeof variants;
  message: string;
  children?: ReactNode;
};

// Estado vacío, error o sin permiso: una lista que falla nunca se muestra como "sin registros"
export default function StateMessage({
  variant = "empty",
  message,
  children,
}: StateMessageProps) {
  const { icon: Icon, className } = variants[variant];
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
      <Icon className={`size-10 ${className}`} aria-hidden="true" />
      <p className="text-base-content/70 max-w-md text-sm">{message}</p>
      {children}
    </div>
  );
}
