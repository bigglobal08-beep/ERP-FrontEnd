// GET /api/health: lo usa el healthcheck de Docker para saber si el servidor de Next responde.
export function GET() {
  return Response.json({ status: "ok" });
}
