FROM node:24

WORKDIR /app

# 依存のインストール
COPY ./package.json ./package-lock.json ./
COPY ./backend/command/package.json ./backend/command/package.json
RUN --mount=type=cache,target=/root/.npm npm -w backend/command install
RUN --mount=type=cache,target=/root/.npm npm install --ignore-workspace-root-check

# ビルド
COPY . . 
RUN npm -w backend/command run build

ENTRYPOINT [ "node","--enable-source-maps", "--inspect=0.0.0.0:9229", "/app/backend/command/dist/main.js" ]
