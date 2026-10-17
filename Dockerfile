# ---------- Etapa 1: deps ----------
# Instala TODAS las dependencias (incluidas las de desarrollo: TypeScript, Tailwind, ESLint) para poder compilar.
FROM node:24-alpine AS deps
WORKDIR /app

# Copiamos primero solo package*.json: si no cambian, Docker reutiliza la capa de `npm ci` (build más rápido).
COPY package*.json ./
RUN npm ci

# ---------- Etapa 2: builder ----------
# Compila Next.js. Con output: "standalone" deja en .next/standalone un server.js con lo mínimo para correr.
FROM node:24-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Las variables NEXT_PUBLIC_* se escriben DENTRO del JavaScript del navegador al compilar:
# cambiarlas en el .env después no sirve, hay que reconstruir la imagen. Cada entorno pasa las suyas
# como build args desde su .env (ver docker-compose.yml).
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# public/ es opcional en el repo; la creamos para que el COPY de la etapa final no falle si no existe.
RUN mkdir -p public && npm run build

# ---------- Etapa 3: runtime ----------
# Imagen final: solo el servidor standalone y los archivos estáticos. Sin código fuente ni node_modules completos.
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# standalone no incluye public/ ni .next/static: se copian aparte, ya con dueño "node".
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# No correr como root dentro del contenedor (la imagen oficial ya trae el usuario "node").
USER node

EXPOSE 3000
CMD ["node", "server.js"]
