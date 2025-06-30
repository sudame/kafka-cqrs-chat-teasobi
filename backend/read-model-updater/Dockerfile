FROM node:24 AS builder

WORKDIR /app

# 依存のインストール
COPY ../../package.json .
COPY ./package.json ./backend/read-model-updater/package.json
RUN --mount=type=cache,target=/root/.npm npm install

# ビルド
COPY . . 
RUN npm -w backend/read-model-updater run build

FROM node:24
WORKDIR /app
COPY --from=builder /app/backend/read-model-updater/dist/main.js .
