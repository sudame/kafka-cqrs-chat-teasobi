FROM node:24 AS builder

WORKDIR /app

# 依存のインストール
COPY ../../package.json .
COPY ./package.json ./backend/query/package.json
RUN --mount=type=cache,target=/root/.npm npm -w backend/query install
RUN --mount=type=cache,target=/root/.npm npm install --ignore-workspace-root-check

# ビルド
COPY . . 
RUN npm -w backend/query run build

FROM node:24
WORKDIR /app
COPY --from=builder /app/backend/query/dist/main.js .
