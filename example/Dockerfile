# Base build stage with all Zest dependencies
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS zest-base
WORKDIR /app

# Install Node.js
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

# TODO: Remove this once Zest is available on NuGet and NPM
COPY Zest.sln .
COPY Zest/ ./Zest/
COPY ZestGenerator/ ./ZestGenerator/
COPY ZestNpm/ ./ZestNpm/
COPY Example/ ./Example/
RUN dotnet build Zest/Zest.csproj -c Debug
RUN dotnet nuget add source /app/Zest/bin/Debug --name LocalZest

FROM zest-base AS backend-build
WORKDIR /app/Example

# Publish the application
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
FROM zest-base AS frontend-build
WORKDIR /app

# Copy generated TypeScript client files from backend build
COPY --from=backend-build /app/Example/frontend/src/generated ./frontend/src/generated

# TODO: Remove this once Zest is available on NuGet and NPM
COPY --from=backend-build /app/ZestNpm /ZestNpm

# Copy frontend package files first for better layer caching
COPY Example/frontend/package*.json ./frontend/

# Install dependencies
WORKDIR /app/frontend
RUN npm install --install-links

# Copy rest of frontend source
COPY Example/frontend/ ./

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

RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/run/nginx && \
    touch /var/run/nginx/nginx.pid && \
    touch /run/nginx.pid

# Set permissions for nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /var/run/nginx && \
    chown -R nginx:nginx /run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx/nginx.pid

# Copy the runtime injection script into the container
COPY Example/frontend/env.sh /docker-entrypoint.d/env.sh
RUN dos2unix /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh

# Expose port 80
EXPOSE 80

# Use nginx user
USER nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
