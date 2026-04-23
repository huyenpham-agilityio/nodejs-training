ARG NODE_VERSION=20.19.3

################################################################################
# Base stage
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app

################################################################################
# Development stage
FROM base AS development
ENV NODE_ENV=development
ENV HUSKY=0
COPY package.json package-lock.json ./
RUN npm ci
EXPOSE 8080
CMD ["npm", "run", "dev"]

################################################################################
# Production deps stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm pkg delete scripts.prepare && npm ci --omit=dev

################################################################################
# Build stage
FROM base AS build
ENV HUSKY=0
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

################################################################################
# Final production stage
FROM base AS final
ENV NODE_ENV=production
RUN mkdir -p /usr/src/app/logs && chown -R node:node /usr/src/app
USER node
COPY package.json .
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
EXPOSE 8080
CMD ["npm", "start"]
