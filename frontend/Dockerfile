FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM alpine:3.20

WORKDIR /app

COPY --from=builder /app/dist /tmp/dist

CMD ["sh", "-c", "rm -rf /frontend-dist/* && cp -r /tmp/dist/* /frontend-dist/"]