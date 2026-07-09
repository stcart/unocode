FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM deps AS builder
COPY tsconfig.json ./
COPY src ./src
COPY templates ./templates
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY templates ./templates
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x docker-entrypoint.sh \
  && sed -i 's/\r$//' docker-entrypoint.sh \
  && mkdir -p uploads/reports

EXPOSE 3001

ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
