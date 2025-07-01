# Build stage for Elysia
FROM oven/bun AS build
WORKDIR /app

# Cache packages installation
COPY package.json bun.lockb ./
RUN bun install

# Copy source files and public directory
COPY ./src ./src

ENV NODE_ENV=production

# Compile the application
RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --target bun \
    --outfile /app/server \
    ./src/index.ts

# Final stage with Caddy
FROM caddy:latest
WORKDIR /app

# Copy the compiled server and public directory from build stage
COPY --from=build /app/server /app/server
RUN chmod +x /app/server

# Copy Caddy configuration
COPY Caddyfile /etc/caddy/Caddyfile

# Create necessary directories
RUN mkdir -p /var/log/caddy

# Set environment variables
ENV NODE_ENV=production

# Expose ports
EXPOSE 80 443

# Start both Caddy and the compiled server
CMD ["sh", "-c", "/app/server & caddy run --config /etc/caddy/Caddyfile"]