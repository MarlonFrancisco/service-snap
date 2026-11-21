# Web (Next.js) com `next start`. Usado pela Railway.
# Contexto do build: raiz do monorepo (precisa dos pacotes em packages/).
FROM node:24-bookworm-slim

WORKDIR /app

RUN npm install -g pnpm@8.15.5

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/analytics/package.json packages/analytics/
COPY packages/api/package.json packages/api/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/shared/package.json packages/shared/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY packages/ui/package.json packages/ui/
COPY packages/vitest-config/package.json packages/vitest-config/
RUN pnpm install --frozen-lockfile

# NEXT_PUBLIC_* entram no bundle durante o build. A Railway só repassa ao
# build as variáveis declaradas como ARG aqui.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_CDN_URL
ARG NEXT_PUBLIC_GTM_ID
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_ALLOW_INDEXING
ARG NEXT_PUBLIC_ANALYTICS_DEBUG

COPY . .
RUN pnpm turbo run build --filter=web

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app/apps/web

# `next start` lê PORT (definida pela Railway).
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start"]
