# --- Development ---
FROM node:20-alpine AS development
WORKDIR /srv/app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
CMD ["npm", "run", "develop"]

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
COPY --from=build /srv/app ./
RUN npm ci --omit=dev || npm install --omit=dev
EXPOSE 1337
CMD ["npm", "start"]
