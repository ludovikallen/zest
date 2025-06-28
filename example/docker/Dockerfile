# Base build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS example-base
WORKDIR /app

# Install Node.js
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

FROM example-base AS backend-build
WORKDIR /app

# Copy backend source files
COPY backend/ ./backend/
# Copy frontend files that backend references during build
COPY frontend/ ./frontend/

WORKDIR /app/backend

# Restore and publish the application without frontend project reference
RUN dotnet restore Example.csproj
RUN dotnet publish Example.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 as backend
WORKDIR /app

# Copy the published application
COPY --from=backend-build /app/publish .

# Expose the port
EXPOSE 8080

# Create a non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

ENTRYPOINT ["dotnet", "Example.dll"]

# Use the base image with all dependencies built and TypeScript client generated
FROM example-base AS frontend-build
WORKDIR /app

# Create frontend structure and copy generated files if they exist
RUN mkdir -p ./frontend/src/generated
# Note: Copy generated files from backend build if they exist
# This step may fail if no generated files exist, which is OK for initial builds

# Copy frontend package files first for better layer caching
COPY frontend/package*.json ./frontend/

# Install dependencies
WORKDIR /app/frontend
RUN npm install

# Copy rest of frontend source
COPY frontend/ ./

# Make sure we're in the frontend directory and build the application
WORKDIR /app/frontend
RUN npm run build

# Production stage - nginx with built static files
FROM nginx:alpine AS frontend
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built frontend from build stage
COPY --from=frontend-build /app/frontend/dist .

RUN mkdir -p /var/cache/nginx/client_temp &&     mkdir -p /var/run/nginx &&     touch /var/run/nginx/nginx.pid &&     touch /run/nginx.pid

# Set permissions for nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html &&     chown -R nginx:nginx /var/cache/nginx &&     chown -R nginx:nginx /var/log/nginx &&     chown -R nginx:nginx /etc/nginx/conf.d &&     chown -R nginx:nginx /var/run/nginx &&     chown -R nginx:nginx /run/nginx.pid &&     chown -R nginx:nginx /var/run/nginx/nginx.pid

# Create the runtime injection script directly in the container
RUN mkdir -p /docker-entrypoint.d

# Create env.sh script for environment variable replacement
RUN cat <<'EOF' > /docker-entrypoint.d/env.sh
set -e

# Display the current directory being scanned
echo "Scanning directory: /usr/share/nginx/html"

# Iterate through each environment variable that starts with ZEST_
env | grep "^ZEST_" | while IFS='=' read -r key value; do
    echo "  • Replacing ${key} → ${value}"
    find "/usr/share/nginx/html" -type f         -exec sed -i "s|${key}|${value}|g" {} +
done
EOF

RUN dos2unix /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh

# Expose port 80
EXPOSE 80

# Use nginx user
USER nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]