FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
ENV CI=true
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package management files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (frozen-lockfile is default for ci/install)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
# We use direct commands to avoid the redundant 'pnpm install' in the build:prod script
RUN rm -rf node_modules/.vite-temp && pnpm tsc -b && BUILD_MODE=prod pnpm vite build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
