FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 5000
CMD ["node", "src/server.js"]
