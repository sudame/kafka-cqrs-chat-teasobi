FROM node:24 AS builder

WORKDIR /app

# 依存のインストール
COPY ../../package.json .
COPY ./package.json ./backend/command/package.json
RUN --mount=type=cache,target=/root/.npm npm -w backend/command install
RUN --mount=type=cache,target=/root/.npm npm install --ignore-workspace-root-check

# ビルド
COPY . . 
RUN npm -w backend/command run build

FROM node:24
WORKDIR /app
COPY --from=builder /app/backend/command/dist/main.js .
