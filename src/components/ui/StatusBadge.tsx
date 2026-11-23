export default function StatusBadge({
  active,
  feminine = false,
}: {
  active: boolean;
  feminine?: boolean;
}) {
  const label = active
    ? feminine ? "Activa" : "Activo"
    : feminine ? "Inactiva" : "Inactivo";
  return (
    <span className={`badge badge-soft badge-sm ${active ? "badge-success" : "badge-neutral"}`}>
      {label}
    </span>
  );
}
