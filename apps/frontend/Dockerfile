# --- Development ---
FROM node:20-alpine AS development
WORKDIR /srv/app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
CMD ["npm", "run", "dev"]

# --- Build ---
FROM node:20-alpine AS build
WORKDIR /srv/app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# --- Production ---
FROM node:20-alpine AS production
WORKDIR /srv/app
ENV NODE_ENV=production
COPY --from=build /srv/app/.next ./.next
COPY --from=build /srv/app/public ./public
COPY --from=build /srv/app/package.json ./
COPY --from=build /srv/app/node_modules ./node_modules
COPY --from=build /srv/app/next.config.js ./
EXPOSE 3000
CMD ["npm", "start"]
