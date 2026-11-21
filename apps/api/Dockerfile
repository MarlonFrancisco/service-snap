# API (NestJS) como servidor Node comum. Usado pela Railway.
# Contexto do build: raiz do monorepo (precisa dos pacotes em packages/).
FROM node:24-bookworm-slim

WORKDIR /app

RUN npm install -g pnpm@8.15.5

# Manifestos primeiro: o install fica em cache enquanto o lockfile não muda.
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

COPY . .
RUN pnpm turbo run build --filter=api

ENV NODE_ENV=production

WORKDIR /app/apps/api

# A Railway define PORT; o main.ts já escuta em process.env.PORT.
EXPOSE 3000
CMD ["node", "dist/main.js"]
