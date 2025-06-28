# Example

A Zest application with .NET backend and React frontend.

## Features

- ✅ Authentication
- ✅ Weather API Example
- ✅ Docker Support

## Getting Started

### Prerequisites

- .NET 9.0
- Node.js 18 or later
- npm

### Installation

1. Clone this repository
2. Install .NET dependencies:
   ```
   cd backend
   dotnet restore
   cd ..
   ```

3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   cd ..
   ```

### Running the Application

**Option 1: Using the command line**

1. Start the backend:
   ```
   cd backend
   dotnet run
   ```

2. In a separate terminal, start the frontend:
   ```
   cd frontend
   npm run dev
   ```

**Option 2: Using Visual Studio**

1. Open `Example.sln` in Visual Studio
2. Set the startup projects to both the backend and frontend projects
3. Press F5 to run both projects simultaneously

The application will be available at:
- Backend: http://localhost:5226
- Frontend: http://localhost:5173

## Project Structure

```
Example/
├── backend/              # .NET backend
│   ├── Controllers/      # API Controllers
│   ├── Properties/       # Launch settings
│   ├── Program.cs        # Application entry point
│   ├── Example.csproj
│   └── appsettings.json
├── docker/               # Docker configuration
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── templates/        # Nginx configuration templates
├── frontend/             # React frontend
│   ├── src/
│   │   ├── auth/        # Authentication components
│   │   ├── App.tsx      # Main App component
│   │   └── main.tsx     # App entry point
│   ├── package.json
│   └── vite.config.ts
├── Example.sln   # Solution file (bundles frontend & backend)
└── README.md
```

## Built With

- [Zest](https://github.com/ludovikallen/zest) - Full-stack framework
- [.NET 9.0](https://dotnet.microsoft.com/) - Backend framework
- [React](https://reactjs.org/) - Frontend library
- [Vite](https://vitejs.dev/) - Frontend build tool
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
