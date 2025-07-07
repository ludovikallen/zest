# @ludovikallen/create-zest

A CLI tool to create Zest applications with .NET backend and React frontend.

## Usage

### Interactive Mode

```bash
npm create @ludovikallen/zest
```

This will prompt you for:
- Project name (must be in CamelCase, e.g., MyZestApp)
- Include authentication
- Include todo functionality with sample CRUD API
- Include Docker files for deployment
- Database type (SQLite, PostgreSQL, or In-Memory)
- Package manager preference (npm, yarn, or pnpm)
- Skip automatic setup commands

### Command Line Mode

```bash
npm create @ludovikallen/zest MyZestAp
```

### Options
- `--auth`: Include authentication (default: false)
- `--todo`: Include todo functionality with sample CRUD API (default: false)
- `--docker`: Include Docker files for deployment (default: true)
- `--database`: Database type - `sqlite`, `postgresql`, or `inmemory` (default: sqlite)
- `--package-manager`: Package manager - `npm`, `yarn`, or `pnpm` (default: npm)
- `--no-setup`: Skip automatic setup commands (default: false)
- `--help`: Show help

## Features

The CLI can generate projects with the following features:

### Core Features
- **Zest Framework**: Full-stack framework with .NET backend and React frontend
- **TypeScript**: Type-safe development for both frontend and backend
- **Vite**: Fast frontend build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React 19**: Latest React with modern features
- **Todo API Example**: Sample CRUD API with Entity Framework (optional)
- **Theme Toggle**: Dark/light mode support
- **ESLint**: Code linting and formatting

### Optional Features
- **Authentication**: User registration and login with Zest Auth
- **Docker Support**: Dockerfile and docker-compose.yml for deployment
- **Database Options**: SQLite, PostgreSQL, or In-Memory database
- **Dev Environment**: Docker PostgreSQL setup for development

### Supported Options
- **Database Types**: SQLite (default), PostgreSQL, In-Memory
- **Package Managers**: npm (default), yarn, or pnpm
- **.NET Version**: .NET 9.0

## Generated Project Structure

```
MyZestApp/
├── backend/                 # .NET Backend
│   ├── Controllers/         # API Controllers
│   │   └── TodoController.cs
│   ├── Entities/           # Data models
│   │   ├── BaseEntity.cs
│   │   ├── Status.cs
│   │   └── Todo.cs
│   ├── Repositories/       # Data access layer
│   │   ├── ITodoRepository.cs
│   │   └── TodoRepository.cs
│   ├── Properties/
│   │   └── launchSettings.json
│   ├── ApplicationDbContext.cs
│   ├── Program.cs          # .NET entry point
│   ├── MyZestApp.csproj   # .NET project file
│   ├── appsettings.json   # Configuration
│   └── appsettings.Development.json
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── auth/          # Authentication components (if enabled)
│   │   ├── components/    # React components
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── TodoPage.tsx
│   │   ├── contexts/      # React contexts
│   │   │   ├── ThemeContext.tsx
│   │   │   ├── ThemeContextType.ts
│   │   │   └── useTheme.ts
│   │   ├── App.tsx        # Main App component
│   │   ├── Main.tsx       # App entry point
│   │   ├── index.css      # Global styles
│   │   └── vite-env.d.ts
│   ├── public/
│   │   └── vite.svg
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── eslint.config.js
│   └── myapp.frontend.esproj
├── dev/                    # Development environment (if PostgreSQL)
│   └── docker-compose.yml
├── docker/                 # Docker deployment (if enabled)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── templates/
│       └── default.conf.template
├── MyZestApp.sln          # Visual Studio solution
├── MyZestApp.slnLaunch    # Solution launch configuration
├── README.md              # Project documentation
└── .gitignore
```

## Getting Started with Generated Project

After creating your project:

1. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install  # or yarn/pnpm based on your choice
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   dotnet restore
   ```

3. **Set up database (if using SQLite or PostgreSQL):**
   ```bash
   # For PostgreSQL, first start the dev environment:
   cd dev
   docker compose up -d
   cd ../backend
   
   # Install EF tools and create database:
   dotnet tool install --global dotnet-ef
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

4. **Run the application:**
   ```bash
   # From the backend directory:
   dotnet run
   
   # Or open the solution in Visual Studio:
   # MyZestApp.sln
   ```

5. **Access your app:**
   - Backend API: `http://localhost:5226`
   - Frontend: `http://localhost:5173` (Vite dev server)
   - API Documentation: Available through Zest framework

## Development Workflow

### Backend Development
- Todo API controllers in `/backend/Controllers`
- Entity models in `/backend/Entities`
- Repository pattern in `/backend/Repositories`
- Entity Framework DbContext in `/backend/ApplicationDbContext.cs`
- Configuration in `appsettings.json` and `appsettings.Development.json`

### Frontend Development
- React components in `/frontend/src/components`
- Context providers in `/frontend/src/contexts`
- Authentication components in `/frontend/src/auth` (if auth enabled)
- Theme system with dark/light mode toggle
- TypeScript client generation via Zest framework
- Hot reload via Vite dev server with Tailwind CSS

### Visual Studio Integration
- Complete solution file (`.sln`) for both projects
- Launch configuration for simultaneous backend/frontend debugging
- Frontend project configured as JavaScript project (`.esproj`)

## Requirements

- **Node.js** 18 or later
- **.NET SDK** 9.0
- **npm/yarn/pnpm** (based on preference)
- **Docker** (optional, for PostgreSQL database or deployment)
- **Visual Studio** (recommended for best development experience)

## About Zest

Zest is a full-stack framework that provides:
- Automatic TypeScript client generation from .NET APIs
- Built-in authentication and authorization
- Seamless integration between .NET backend and React frontend
- Development tools and utilities

## License

MIT

## Contributing

This is part of the Zest framework ecosystem.
