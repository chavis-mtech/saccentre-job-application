FROM node:24-alpine AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY nest-cli.json prisma7.config.ts tsconfig.build.json tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN pnpm build

FROM node:24-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=3001

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 3001

CMD ["node", "dist/main.js"]
