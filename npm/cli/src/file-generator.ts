import fs from "fs-extra";
import path from "path";
import type { ProjectOptions } from "./types.js";

export async function createAdditionalFiles(
  projectPath: string,
  options: ProjectOptions
): Promise<void> {
  const { projectName, docker, database } = options;

  // Create README.md
  await createReadme(projectPath, options);

  // Create .gitignore
  await createGitignore(projectPath);

  // Create Docker files if Docker support is selected
  if (docker) {
    await createDockerFiles(
      projectPath,
      projectName,
      options.database !== "inmemory"
    );
  }

  // Create dev folder with PostgreSQL docker-compose if PostgreSQL is selected
  if (database === "postgresql") {
    await createDevPostgreSQLFiles(projectPath, projectName);
  }
}

async function createReadme(
  projectPath: string,
  options: ProjectOptions
): Promise<void> {
  const { projectName, docker, todo } = options;

  const readmeContent = `# ${projectName}

A Zest application with .NET backend and React frontend.

## Features

${options.useAuth ? "- ✅ Authentication" : "- ❌ Authentication"}
${todo ? "- ✅ Todo API Example" : "- ❌ Todo API Example"}
${docker ? "- ✅ Docker Support" : "- ❌ Docker Support"}

## Getting Started

### Prerequisites

- .NET 9.0
- Node.js 18 or later
- ${options.packageManager}${
    options.database === "postgresql"
      ? "\n- Docker (for PostgreSQL database)"
      : ""
  }

### Installation

1. Clone this repository
${
  options.database === "postgresql"
    ? "2. Start the PostgreSQL database:\n   ```\n   cd dev\n   docker compose up -d\n   cd ..\n   ```\n\n3"
    : "2"
}. Install .NET dependencies:
   \`\`\`
   cd backend
   dotnet restore
   cd ..
   \`\`\`

${options.database === "postgresql" ? "4" : "3"}. Install frontend dependencies:
   \`\`\`
   cd frontend
   ${options.packageManager} install
   cd ..
   \`\`\`

### Running the Application

**Option 1: Using the command line**

1. Start the backend:
   \`\`\`
   cd backend
   dotnet run
   \`\`\`

2. In a separate terminal, start the frontend:
   \`\`\`
   cd frontend
   ${options.packageManager} run dev
   \`\`\`

**Option 2: Using Visual Studio**

1. Open \`${projectName}.sln\` in Visual Studio
2. Set the startup projects to both the backend and frontend projects
3. Press F5 to run both projects simultaneously

The application will be available at:
- Backend: http://localhost:5226
- Frontend: http://localhost:5173

## Project Structure

\`\`\`
${projectName}/
├── backend/              # .NET backend
│   ├── Controllers/      # API Controllers
│   ├── Properties/       # Launch settings
│   ├── Program.cs        # Application entry point
│   ├── ${projectName}.csproj
│   └── appsettings.json${
    options.database === "postgresql"
      ? "\n├── dev/                  # PostgreSQL development setup"
      : ""
  }${
    docker
      ? "\n├── docker/               # Docker configuration\n│   ├── Dockerfile\n│   ├── docker-compose.yml\n│   └── templates/        # Nginx configuration templates"
      : ""
  }
├── frontend/             # React frontend
│   ├── src/
│   │   ├── auth/        # Authentication components
│   │   ├── App.tsx      # Main App component
│   │   └── main.tsx     # App entry point
│   ├── package.json
│   └── vite.config.ts
├── ${projectName}.sln   # Solution file (bundles frontend & backend)
└── README.md
\`\`\`

## Built With

- [Zest](https://github.com/ludovikallen/zest) - Full-stack framework
- [.NET 9.0](https://dotnet.microsoft.com/) - Backend framework
- [React](https://reactjs.org/) - Frontend library
- [Vite](https://vitejs.dev/) - Frontend build tool
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
`;

  await fs.writeFile(path.join(projectPath, "README.md"), readmeContent);
}

async function createGitignore(projectPath: string): Promise<void> {
  const gitignoreContent = `# Dependencies
node_modules/
**/node_modules/

# Build outputs
**/bin/
**/obj/
**/dist/
**/build/
**/generated/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vs/
.vscode/
*.suo
*.user
.DS_Store

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Test results
test-results/
playwright-report/
`;

  await fs.writeFile(path.join(projectPath, ".gitignore"), gitignoreContent);
}

async function createDockerFiles(
  projectPath: string,
  projectName: string,
  databaseMigration: boolean
): Promise<void> {
  const dockerPath = path.join(projectPath, "docker");
  await fs.ensureDir(dockerPath);
  const lowerCaseProjectName = projectName.toLowerCase();

  await createNginxTemplate(dockerPath);

  const dockerfileContent = `# Base build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS ${lowerCaseProjectName}-base
WORKDIR /app

# Install Node.js
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

FROM ${lowerCaseProjectName}-base AS backend-build
WORKDIR /app

# Copy backend source files
COPY backend/ ./backend/
# Copy frontend files that backend references during build
COPY frontend/ ./frontend/

WORKDIR /app/backend

# Restore and publish the application without frontend project reference
RUN dotnet restore ${projectName}.csproj
RUN dotnet publish ${projectName}.csproj -c Release -o /app/publish
${
  databaseMigration
    ? `
# Database migration stage
FROM backend-build as db-migration
WORKDIR /app/backend

ARG CONNECTION_STRING
# Install EF tools and run database migrations
RUN dotnet tool install --global dotnet-ef --version 9.0.6
RUN /root/.dotnet/tools/dotnet-ef database update --connection $CONNECTION_STRING --project Statsify.csproj
`
    : ""
}
# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 as backend
WORKDIR /app

# Copy the published application
COPY --from=${
    databaseMigration ? "db-migration" : "backend-build"
  } /app/publish .

# Expose the port
EXPOSE 8080

# Create a non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

ENTRYPOINT ["dotnet", "${projectName}.dll"]

# Use the base image with all dependencies built and TypeScript client generated
FROM ${lowerCaseProjectName}-base AS frontend-build
WORKDIR /app

# Copy generated files from backend build stage
COPY --from=backend-build /app/frontend/ ./frontend/
RUN echo "VITE_API_BASE_URL=ZEST_API_BASE_URL" > /app/frontend/.env

# Install dependencies
WORKDIR /app/frontend
RUN npm install
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

# Create the runtime injection script directly in the container
RUN mkdir -p /docker-entrypoint.d

# Create env.sh script for environment variable replacement
RUN cat <<'EOF' > /docker-entrypoint.d/env.sh
set -e

# Display the current directory being scanned
echo "Scanning directory: /usr/share/nginx/html"

# Iterate through each environment variable that starts with ZEST_
env | grep "^ZEST_" | while IFS='=' read -r key value; do
    echo "  • Replacing \${key} → \${value}"
    find "/usr/share/nginx/html" -type f \
        -exec sed -i "s|\${key}|\${value}|g" {} +
done
EOF

RUN dos2unix /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh

# Expose port 80
EXPOSE 80

# Use nginx user
USER nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]`;

  await fs.writeFile(path.join(dockerPath, "Dockerfile"), dockerfileContent);

  const dockerComposeContent = `version: '3.8'

services:
  backend:
    build:
      context: ..
      dockerfile: docker/Dockerfile
      target: backend
      ${
        databaseMigration
          ? "args:\n        CONNECTION_STRING: ${DATABASE_CONNECTION_STRING:-}"
          : ""
      }
    container_name: ${projectName.toLowerCase()}-backend
    environment:
      BACKEND_PORT: \${BACKEND_PORT:-8080}
      ASPNETCORE_ENVIRONMENT: Production
      ASPNETCORE_URLS: http://+:\${BACKEND_PORT:-8080}
      ConnectionStrings__DefaultConnection: \${DATABASE_CONNECTION_STRING:-}
      Cors__AllowedOrigins__0: \${BASE_URL:-http://localhost}
      Cors__AllowedOrigins__1: \${BASE_URL:-http://localhost}:\${NGINX_LISTEN_PORT:-80}
    ports:
      - "\${BACKEND_PORT:-8080}:\${BACKEND_PORT:-8080}"
    networks:
      - ${projectName.toLowerCase()}-network

  frontend:
    build:
      context: ..
      dockerfile: docker/Dockerfile
      target: frontend
    container_name: ${projectName.toLowerCase()}-frontend
    environment:
      BASE_URL: \${BASE_URL:-http://localhost}
      BACKEND_PORT: \${BACKEND_PORT:-8080}
      NGINX_API_PATH_SEGMENT: \${NGINX_API_PATH_SEGMENT:-api}
      ZEST_API_BASE_URL: \${BASE_URL:-http://localhost}/\${NGINX_API_PATH_SEGMENT:-api}
      NGINX_LISTEN_PORT: \${NGINX_LISTEN_PORT:-80}
    ports:
      - "\${NGINX_LISTEN_PORT:-80}:\${NGINX_LISTEN_PORT:-80}"
    networks:
      - ${projectName.toLowerCase()}-network
    volumes:
      - ./templates:/etc/nginx/templates
    depends_on:
      - backend

networks:
  ${projectName.toLowerCase()}-network:
    driver: bridge

volumes:
  nginx-cache:
  nginx-logs:`;

  await fs.writeFile(
    path.join(dockerPath, "docker-compose.yml"),
    dockerComposeContent
  );
}

async function createDevPostgreSQLFiles(
  projectPath: string,
  projectName: string
): Promise<void> {
  const devPath = path.join(projectPath, "dev");
  await fs.ensureDir(devPath);

  const devDockerComposeContent = `version: '3.8'
name: ${projectName.toLowerCase()}-dev
services:
  postgres:
    image: postgres:16-alpine
    container_name: ${projectName.toLowerCase()}-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: ${projectName.toLowerCase()}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;

  await fs.writeFile(
    path.join(devPath, "docker-compose.yml"),
    devDockerComposeContent
  );

  // Create a README for the dev folder
  const devReadmeContent = `# Development Database

This folder contains the PostgreSQL database setup for development.

## Quick Start

1. Start the PostgreSQL database:
   \`\`\`bash
   docker compose up -d
   \`\`\`

2. Stop the database:
   \`\`\`bash
   docker compose down
   \`\`\`

3. Reset the database (removes all data):
   \`\`\`bash
   docker compose down -v
   docker compose up -d
   \`\`\`

## Database Connection Details

- **Host:** localhost
- **Port:** 5432
- **Database:** ${projectName.toLowerCase()}
- **Username:** postgres
- **Password:** postgres

## Connection String

Use this connection string in your application:
\`\`\`
postgres://postgres:postgres@localhost:5432/${projectName.toLowerCase()}
\`\`\`
`;

  await fs.writeFile(path.join(devPath, "README.md"), devReadmeContent);
}

async function createNginxTemplate(dockerPath: string): Promise<void> {
  const templatesPath = path.join(dockerPath, "templates");
  await fs.ensureDir(templatesPath);

  const nginxTemplateContent = `# Upstream backend server
upstream backend {
    server backend:\${BACKEND_PORT};
}

server {
    listen \${NGINX_LISTEN_PORT};
    server_name localhost;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Root location for React app
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    location = /\${NGINX_API_PATH_SEGMENT} {
        return 302 /\${NGINX_API_PATH_SEGMENT}/;
    }
    
    # API proxy to backend
    location /\${NGINX_API_PATH_SEGMENT}/ {
        proxy_pass http://backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Enable CORS for API requests
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}`;

  await fs.writeFile(
    path.join(templatesPath, "default.conf.template"),
    nginxTemplateContent
  );
}
