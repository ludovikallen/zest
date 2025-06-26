# @ludovikallen/create-zest

A CLI tool to create Zest applications with .NET backend and React frontend.

## Quick Start

```bash
npm create @ludovikallen/zest my-app
cd my-app
dotnet restore
cd frontend && npm install
dotnet run
```

## Usage

### Interactive Mode

```bash
npm create @ludovikallen/zest
```

This will prompt you for:
- Project name
- Authentication setup
- Features to include
- .NET version
- Package manager preference

### Command Line Options

```bash
npm create @ludovikallen/zest my-app --name my-project --yes
```

#### Options

- `--name, -n`: Project name
- `--yes, -y`: Use default options (includes auth, weather API, EF Core, Swagger, ESLint)
- `--help`: Show help

## Features

The CLI can generate projects with the following features:

### Core Features
- ✅ **Zest Framework**: Full-stack framework with .NET backend and React frontend
- ✅ **TypeScript**: Type-safe development for both frontend and backend
- ✅ **Vite**: Fast frontend build tool and dev server

### Optional Features
- 🔐 **Authentication**: User registration and login with Zest Auth
- 🌤️ **Weather API Example**: Sample API controller and frontend integration
- 🗄️ **Entity Framework Core**: In-memory database setup
- 📚 **Swagger/OpenAPI**: Automatic API documentation
- 🐳 **Docker Support**: Dockerfile and docker-compose.yml
- 🔍 **ESLint**: Code linting and formatting for React

### Supported Options
- **.NET Versions**: .NET 8.0 (LTS) or .NET 9.0 (Latest)
- **Package Managers**: npm, yarn, or pnpm

## Generated Project Structure

```
my-zest-app/
├── Controllers/              # .NET API Controllers
│   └── WeatherForecastController.cs
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── auth/           # Authentication components
│   │   ├── App.tsx         # Main App component
│   │   ├── main.tsx        # App entry point
│   │   └── ...
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
├── Properties/
│   └── launchSettings.json
├── Program.cs              # .NET entry point
├── MyZestApp.csproj       # .NET project file
├── appsettings.json       # Configuration
├── README.md              # Project documentation
├── .gitignore
├── Dockerfile             # (if Docker support enabled)
└── docker-compose.yml     # (if Docker support enabled)
```

## Getting Started with Generated Project

After creating your project:

1. **Install backend dependencies:**
   ```bash
   dotnet restore
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install  # or yarn/pnpm based on your choice
   ```

3. **Run the application:**
   ```bash
   dotnet run
   ```

4. **Access your app:**
   - Backend API: `https://localhost:7000`
   - Frontend: `http://localhost:5173` (Vite dev server)
   - Swagger UI: `https://localhost:7000/swagger` (if enabled)

## Development Workflow

### Backend Development
- API controllers in `/Controllers`
- Models and services as needed
- Configuration in `appsettings.json`
- Entity Framework DbContext (if EF Core enabled)

### Frontend Development
- React components in `/frontend/src`
- Authentication context and hooks (if auth enabled)
- API client generation via Zest
- Hot reload via Vite dev server

## Requirements

- **Node.js** 18 or later
- **.NET SDK** 8.0 or 9.0
- **npm/yarn/pnpm** (based on preference)

## About Zest

Zest is a full-stack framework that provides:
- Automatic TypeScript client generation from .NET APIs
- Built-in authentication and authorization
- Seamless integration between .NET backend and React frontend
- Development tools and utilities

## License

MIT

## Contributing

This is part of the Zest framework ecosystem. Please visit the main Zest repository for contribution guidelines.
