# ======================================================================
# Dockerfile cho ứng dụng NestJS - Tối ưu cho Production
# ======================================================================

# --- Giai đoạn 1: Builder ---
# Giai đoạn này cài đặt tất cả dependencies (bao gồm cả devDependencies)
# để build ứng dụng và tạo Prisma Client.
FROM node:20-alpine AS builder

# Thiết lập môi trường
ENV NODE_ENV=production

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép file quản lý package
COPY package*.json ./

# Cài đặt tất cả dependencies, bao gồm cả devDependencies cần cho build
RUN npm ci

# Sao chép toàn bộ mã nguồn của ứng dụng
COPY . .

# Tạo Prisma Client để đảm bảo nó có sẵn cho quá trình build
RUN npx prisma generate

# Build ứng dụng NestJS (biên dịch TypeScript sang JavaScript)
RUN npm run build

# --- Giai đoạn 2: Production ---
# Giai đoạn này tạo ra image cuối cùng, chỉ chứa những file cần thiết để chạy.
FROM node:20-alpine AS production

# Thiết lập môi trường
ENV NODE_ENV=production

WORKDIR /app

# Sao chép file quản lý package
COPY package*.json ./

# Chỉ cài đặt production dependencies
RUN npm ci --omit=dev

# Sao chép bản build của ứng dụng từ giai đoạn "builder"
COPY --from=builder /app/dist ./dist

# Sao chép thư mục prisma (chứa schema) để có thể chạy migrations
COPY --from=builder /app/prisma ./prisma

# Mở cổng mà ứng dụng NestJS sẽ chạy (đọc từ biến môi trường hoặc mặc định 3000)
# Biến PORT sẽ được inject vào lúc runtime, ví dụ bằng Docker Compose
EXPOSE 3000

# Lệnh để khởi động ứng dụng
# "npx prisma migrate deploy" sẽ áp dụng các migration chưa được chạy.
# Sau đó, "node dist/main.js" sẽ khởi động server.
# Đây là cách phổ biến để đảm bảo database luôn được cập nhật trước khi app chạy.
CMD ["npm run build", "npx prisma migrate deploy && node dist/main.js"]

# --- Ghi chú ---
# Để build image, chạy lệnh sau ở thư mục gốc của dự án NestJS:
# docker build -t my-nestjs-app .
#
# Để chạy container:
# docker run -p 3000:3000 --env-file .env my-nestjs-app
#
# Đảm bảo bạn có file `.dockerignore` ở thư mục gốc để tối ưu hóa quá trình build.
# Ví dụ file .dockerignore:
#
# .git
# node_modules
# dist
# .env
#
