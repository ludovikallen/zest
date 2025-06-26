import fs from 'fs-extra';
import path from 'path';
export async function createAdditionalFiles(projectPath, options) {
    const { projectName, features } = options;
    // Create README.md
    await createReadme(projectPath, options);
    // Create .gitignore
    await createGitignore(projectPath);
    // Create Docker files if Docker support is selected
    if (features.includes('docker')) {
        await createDockerFiles(projectPath, projectName);
    }
}
async function createReadme(projectPath, options) {
    const { projectName, features } = options;
    const readmeContent = `# ${projectName}

A Zest application with .NET backend and React frontend.

## Features

${options.useAuth ? '- ✅ Authentication' : '- ❌ Authentication'}
${features.includes('weather') ? '- ✅ Weather API Example' : '- ❌ Weather API Example'}
${features.includes('efcore') ? '- ✅ Entity Framework In-Memory Database' : '- ❌ Entity Framework In-Memory Database'}
${features.includes('swagger') ? '- ✅ Swagger/OpenAPI Documentation' : '- ❌ Swagger/OpenAPI Documentation'}
${features.includes('docker') ? '- ✅ Docker Support' : '- ❌ Docker Support'}
${features.includes('eslint') ? '- ✅ ESLint Configuration' : '- ❌ ESLint Configuration'}

## Getting Started

### Prerequisites

- .NET ${options.dotnetVersion.replace('net', '').replace('.0', '')} or later
- Node.js 18 or later
- ${options.packageManager}

### Installation

1. Clone this repository
2. Install .NET dependencies:
   \`\`\`
   dotnet restore
   \`\`\`

3. Install frontend dependencies:
   \`\`\`
   cd frontend
   ${options.packageManager} install
   \`\`\`

### Running the Application

1. Start the backend:
   \`\`\`
   dotnet run
   \`\`\`

2. In a separate terminal, start the frontend:
   \`\`\`
   cd frontend
   ${options.packageManager} run dev
   \`\`\`

The application will be available at:
- Backend: https://localhost:7000
- Frontend: http://localhost:5173

${features.includes('swagger') ? '\n### API Documentation\n\nSwagger documentation is available at https://localhost:7000/swagger' : ''}

## Project Structure

\`\`\`
${projectName}/
├── Controllers/           # API Controllers
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
└── README.md
\`\`\`

## Built With

- [Zest](https://github.com/ludovikallen/zest) - Full-stack framework
- [.NET ${options.dotnetVersion.replace('net', '').replace('.0', '')}](https://dotnet.microsoft.com/) - Backend framework
- [React](https://reactjs.org/) - Frontend library
- [Vite](https://vitejs.dev/) - Frontend build tool
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
`;
    await fs.writeFile(path.join(projectPath, 'README.md'), readmeContent);
}
async function createGitignore(projectPath) {
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
async function createDockerFiles(projectPath, projectName) {
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
//# sourceMappingURL=file-generator.js.map