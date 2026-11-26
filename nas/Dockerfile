FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY nas/server.mjs ./server.mjs
ENV PORT=8080 DIST_DIR=/app/dist DATA_DIR=/data
VOLUME /data
EXPOSE 8080
CMD ["node", "server.mjs"]
