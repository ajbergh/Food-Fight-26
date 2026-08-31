# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS workspace
WORKDIR /workspace
RUN apt-get update \
    && apt-get install --yes --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable
COPY . .
RUN pnpm install --no-frozen-lockfile

FROM workspace AS game-server-build
RUN pnpm --filter @foodfight/game-server build
RUN pnpm --filter @foodfight/game-server --prod deploy --legacy /deploy/game-server

FROM node:22-bookworm-slim AS game-server
WORKDIR /app
ENV NODE_ENV=production \
    GAME_SERVER_PORT=2567
COPY --from=game-server-build /deploy/game-server ./
EXPOSE 2567
USER node
CMD ["node", "dist/index.js"]

FROM workspace AS platform-api-build
RUN pnpm --filter @foodfight/platform-api build
RUN pnpm --filter @foodfight/platform-api --prod deploy --legacy /deploy/platform-api

FROM node:22-bookworm-slim AS platform-api
WORKDIR /app
ENV NODE_ENV=production \
    PLATFORM_API_PORT=3000
COPY --from=platform-api-build /deploy/platform-api ./
EXPOSE 3000
USER node
CMD ["node", "dist/index.js"]

FROM workspace AS game-client-build
ARG VITE_GAME_SERVER_URL=http://localhost:2567
ARG VITE_PLATFORM_API_URL=http://localhost:3000
ENV VITE_GAME_SERVER_URL=${VITE_GAME_SERVER_URL} \
    VITE_PLATFORM_API_URL=${VITE_PLATFORM_API_URL}
RUN pnpm --filter @foodfight/game-client build

FROM nginx:1.27-alpine AS game-client-static
COPY infra/nginx-static.conf /etc/nginx/conf.d/default.conf
COPY --from=game-client-build /workspace/apps/game-client/dist /usr/share/nginx/html
EXPOSE 8080

FROM workspace AS web-build
RUN pnpm --filter @foodfight/web build

FROM nginx:1.27-alpine AS web-static
COPY infra/nginx-static.conf /etc/nginx/conf.d/default.conf
COPY --from=web-build /workspace/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
