# ======================================================================
# Dockerfile cho ứng dụng NestJS - Tối ưu cho Production
# ======================================================================

# --- Giai đoạn 1: Builder ---
# Giai đoạn này cài đặt tất cả dependencies (bao gồm cả devDependencies)
# để build ứng dụng và tạo Prisma Client.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]