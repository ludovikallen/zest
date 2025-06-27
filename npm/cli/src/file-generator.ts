import fs from 'fs-extra';
import path from 'path';
import type { ProjectOptions } from './types.js';

export async function createAdditionalFiles(projectPath: string, options: ProjectOptions): Promise<void> {
  const { projectName, docker, database } = options;

  // Create README.md
  await createReadme(projectPath, options);
  
  // Create .gitignore
  await createGitignore(projectPath);

  // Create Docker files if Docker support is selected
  if (docker) {
    await createDockerFiles(projectPath, projectName);
  }

  // Create dev folder with PostgreSQL docker-compose if PostgreSQL is selected
  if (database === 'postgresql') {
    await createDevPostgreSQLFiles(projectPath, projectName);
  }
}

async function createReadme(projectPath: string, options: ProjectOptions): Promise<void> {
  const { projectName, docker } = options;
  
  const readmeContent = `# ${projectName}

A Zest application with .NET backend and React frontend.

## Features

${options.useAuth ? '- ✅ Authentication' : '- ❌ Authentication'}
- ✅ Weather API Example
${docker ? '- ✅ Docker Support' : '- ❌ Docker Support'}

## Getting Started

### Prerequisites

- .NET 9.0
- Node.js 18 or later
- ${options.packageManager}${options.database === 'postgresql' ? '\n- Docker (for PostgreSQL database)' : ''}

### Installation

1. Clone this repository
${options.database === 'postgresql' ? '2. Start the PostgreSQL database:\n   ```\n   cd dev\n   docker compose up -d\n cd ..\n   ```\n\n3' : '2'}. Install .NET dependencies:
   \`\`\`
   dotnet restore
   \`\`\`

${options.database === 'postgresql' ? '4' : '3'}. Install frontend dependencies:
   \`\`\`
   cd frontend
   ${options.packageManager} install
   \`\`\`

### Running the Application

**Option 1: Using the command line**

1. Start the backend:
   \`\`\`
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
├── Controllers/           # API Controllers${options.database === 'postgresql' ? '\n├── dev/                  # PostgreSQL development setup' : ''}
├── frontend/             # React frontend
│   ├── src/
│   │   ├── auth/        # Authentication components
│   │   ├── App.tsx      # Main App component
│   │   └── main.tsx     # App entry point
│   ├── package.json
│   └── vite.config.ts
├── Properties/
├── Program.cs           # Application entry point
├── ${projectName}.csproj
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

  await fs.writeFile(path.join(projectPath, 'README.md'), readmeContent);
}

async function createGitignore(projectPath: string): Promise<void> {
  const gitignoreContent = `# Dependencies
node_modules/
*/node_modules/

# Build outputs
bin/
obj/
dist/
build/

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

  await fs.writeFile(path.join(projectPath, '.gitignore'), gitignoreContent);
}

async function createDockerFiles(projectPath: string, projectName: string): Promise<void> {
  const dockerfileContent = `FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM node:18-alpine AS frontend-build
WORKDIR /src/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY *.csproj ./
RUN dotnet restore
COPY . .
COPY --from=frontend-build /src/frontend/dist ./frontend/dist
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "${projectName}.dll"]`;

  await fs.writeFile(path.join(projectPath, 'Dockerfile'), dockerfileContent);

  const dockerComposeContent = `version: '3.8'

services:
  ${projectName.toLowerCase()}:
    build: .
    ports:
      - "8080:8080"
      - "8081:8081"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=https://+:8081;http://+:8080
    volumes:
      - ~/.aspnet/https:/root/.aspnet/https:ro
      - ~/.microsoft/usersecrets:/root/.microsoft/usersecrets:ro`;

  await fs.writeFile(path.join(projectPath, 'docker-compose.yml'), dockerComposeContent);
}

async function createDevPostgreSQLFiles(projectPath: string, projectName: string): Promise<void> {
  const devPath = path.join(projectPath, 'dev');
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

  await fs.writeFile(path.join(devPath, 'docker-compose.yml'), devDockerComposeContent);

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

  await fs.writeFile(path.join(devPath, 'README.md'), devReadmeContent);
}
