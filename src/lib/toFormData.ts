// Convierte los valores de un form a FormData (multipart) para enviar archivos al backend.
// - File/Blob: se adjuntan tal cual
// - Arreglos de valores simples: una entrada por elemento con la misma llave
// - Objetos y arreglos de objetos: JSON
// - null/undefined: se omiten
export function toFormData(values: Record<string, unknown>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    if (value == null) continue;

    if (value instanceof Blob) {
      formData.append(key, value);
    } else if (
      Array.isArray(value) &&
      value.every((item) => item === null || typeof item !== "object")
    ) {
      value.forEach((item) => formData.append(key, String(item)));
    } else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  }

  return formData;
}
