FROM oven/bun:1 AS base
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code and fonts
COPY index.ts tsconfig.json ./
COPY fonts ./fonts

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD ["bun", "run", "index.ts"]

