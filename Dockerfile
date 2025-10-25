FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies (with cache)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy source code and fonts
COPY index.ts tsconfig.json ./
COPY fonts ./fonts

# Expose the port the app runs on (default 3000, but can be overridden with PORT env var)
EXPOSE 3000

# Run the application
CMD ["bun", "run", "start"]

