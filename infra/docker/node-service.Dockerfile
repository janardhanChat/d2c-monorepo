# syntax=docker/dockerfile:1
# Generic image for every Fastify service in the monorepo.
#
#   docker build -f infra/docker/node-service.Dockerfile \
#     --build-arg PACKAGE=@ap/core-api -t ap/core-api .
#
# tsup bundles the service and all its dependencies into dist/main.js,
# so the runtime image contains only that bundle (no node_modules).

FROM node:26-alpine AS build
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NX_DAEMON=false NX_NO_CLOUD=true CI=true
RUN corepack enable
WORKDIR /repo
ARG PACKAGE
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm exec nx run ${PACKAGE}:build --skip-nx-cache
RUN mkdir /out && cp -r "$(pnpm --filter ${PACKAGE} exec pwd)/dist" /out/dist

FROM node:26-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /out/dist ./dist
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- "http://127.0.0.1:${PORT:-4000}/health" || exit 1
CMD ["node", "--enable-source-maps", "dist/main.js"]
