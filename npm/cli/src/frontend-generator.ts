import fs from "fs-extra";
import path from "path";
import type { ProjectOptions } from "./types.js";

export async function createFrontendFiles(
  projectPath: string,
  options: ProjectOptions
): Promise<void> {
  const { projectName, packageManager, useAuth, docker, todo } = options;
  const frontendPath = path.join(projectPath, "frontend");

  await fs.ensureDir(frontendPath);

  const packageJsonContent = {
    name: "frontend",
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "tsc -b && vite build",
      lint: "eslint .",
      preview: "vite preview",
    },
    dependencies: {
      "@ludovikallen/zest": "^0.0.3",
      "@tailwindcss/vite": "^4.1.11",
      react: "^19.1.0",
      "react-dom": "^19.1.0",
      tailwindcss: "^4.1.11",
    },
    devDependencies: {
      "@eslint/js": "^9.25.0",
      "@types/react": "^19.1.2",
      "@types/react-dom": "^19.1.2",
      "@vitejs/plugin-react-swc": "^3.9.0",
      eslint: "^9.25.0",
      "eslint-plugin-react-hooks": "^5.2.0",
      "eslint-plugin-react-refresh": "^0.4.19",
      globals: "^16.0.0",
      typescript: "~5.8.3",
      "typescript-eslint": "^8.30.1",
      vite: "^6.3.5",
    },
  };

  await fs.writeFile(
    path.join(frontendPath, "package.json"),
    JSON.stringify(packageJsonContent, null, 2)
  );

  // Create esproj file
  const esprojContent = `<Project Sdk="Microsoft.VisualStudio.JavaScript.Sdk/1.0.3260360">
    <PropertyGroup>
        <StartupCommand>${packageManager} run dev</StartupCommand>
        <ShouldRunNpmInstall>false</ShouldRunNpmInstall>
        <ShouldRunBuildScript>false</ShouldRunBuildScript>
    </PropertyGroup>
</Project>`;

  await fs.writeFile(
    path.join(frontendPath, `${projectName.toLowerCase()}.frontend.esproj`),
    esprojContent
  );

  // Create vite.config.ts
  const viteConfigContent = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`;

  await fs.writeFile(
    path.join(frontendPath, "vite.config.ts"),
    viteConfigContent
  );

  // Create TypeScript config files
  await createTypeScriptConfigs(frontendPath);

  // Create index.html
  await createIndexHtml(frontendPath, projectName);

  // Create src directory and files
  await createSourceFiles(frontendPath, projectName, useAuth, todo);

  // Create public directory
  await createPublicFiles(frontendPath);

  // Create ESLint config
  await createEslintConfig(frontendPath);

  // Create .vscode folder with launch.json
  await createVSCodeConfig(frontendPath);

  // Create environment files
  await createEnvironmentFiles(frontendPath, docker);
}

async function createTypeScriptConfigs(frontendPath: string): Promise<void> {
  const tsconfigContent = `{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.node.json"
    }
  ]
}`;

  await fs.writeFile(path.join(frontendPath, "tsconfig.json"), tsconfigContent);

  const tsconfigAppContent = `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}`;

  await fs.writeFile(
    path.join(frontendPath, "tsconfig.app.json"),
    tsconfigAppContent
  );

  const tsconfigNodeContent = `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}`;

  await fs.writeFile(
    path.join(frontendPath, "tsconfig.node.json"),
    tsconfigNodeContent
  );
}

async function createIndexHtml(
  frontendPath: string,
  projectName: string
): Promise<void> {
  const indexHtmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/Main.tsx"></script>
  </body>
</html>`;

  await fs.writeFile(path.join(frontendPath, "index.html"), indexHtmlContent);
}

async function createSourceFiles(
  frontendPath: string,
  projectName: string,
  useAuth: boolean,
  todo?: boolean
): Promise<void> {
  const srcPath = path.join(frontendPath, "src");
  await fs.ensureDir(srcPath);

  const mainTsxContent = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`;

  await fs.writeFile(path.join(srcPath, "Main.tsx"), mainTsxContent);

  // Create App.tsx based on features
  await createAppComponent(srcPath, projectName, useAuth, todo);

  // Create CSS files
  await createStyleFiles(srcPath);

  // Create vite-env.d.ts
  const viteEnvContent = `/// <reference types="vite/client" />`;
  await fs.writeFile(path.join(srcPath, "vite-env.d.ts"), viteEnvContent);

  // Create auth files if authentication is enabled
  if (useAuth) {
    await createAuthFiles(srcPath);
  }

  await createComponents(srcPath, useAuth, todo);

  await createContexts(srcPath);
}

async function createAppComponent(
  srcPath: string,
  projectName: string,
  useAuth: boolean,
  todo?: boolean
): Promise<void> {
  let appTsxContent = "";

  if (todo) {
    // Project with todo functionality
    if (useAuth) {
      appTsxContent = `import AuthContainer from './auth/AuthContainer'
import TodoPage from './components/TodoPage'
import { ThemeProvider } from './contexts/ThemeContext'
import { ThemeToggle } from './components/ThemeToggle'
import { useAuth, AuthProvider } from './auth/Auth'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <header className="border-b border-border">
            <div className="container mx-auto flex items-center justify-between p-4">
              <h1 className="text-2xl font-bold text-foreground">${projectName}</h1>
              <ThemeToggle />
            </div>
          </header>
          <main className="container mx-auto p-4">
            <AuthContainer>
              <TodoPage />
            </AuthContainer>
          </main>
        </div>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
`;
    } else {
      appTsxContent = `import TodoPage from './components/TodoPage'
import { ThemeProvider } from './contexts/ThemeContext'
import { ThemeToggle } from './components/ThemeToggle'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold text-foreground">${projectName}</h1>
            <ThemeToggle />
          </div>
        </header>
        <main className="container mx-auto p-4">
          <TodoPage />
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
`;
    }
  } else if (useAuth) {
    // Empty project with auth
    appTsxContent = `import AuthContainer from './auth/AuthContainer'
import { ThemeProvider } from './contexts/ThemeContext'
import { ThemeToggle } from './components/ThemeToggle'
import { useAuth, AuthProvider } from './auth/Auth'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <header className="border-b border-border">
            <div className="container mx-auto flex items-center justify-between p-4">
              <h1 className="text-2xl font-bold text-foreground">${projectName}</h1>
              <ThemeToggle />
            </div>
          </header>
          <main className="container mx-auto p-4">
            <AuthContainer>
              <div className="text-center py-16">
                <h2 className="text-3xl font-bold text-foreground mb-4">Welcome to your Zest app!</h2>
                <p className="text-muted-foreground">Start building your amazing application.</p>
              </div>
            </AuthContainer>
          </main>
        </div>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
`;
  } else {
    // Empty project without auth
    appTsxContent = `import { ThemeProvider } from './contexts/ThemeContext'
import { ThemeToggle } from './components/ThemeToggle'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold text-foreground">${projectName}</h1>
            <ThemeToggle />
          </div>
        </header>
        <main className="container mx-auto p-4">
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Welcome to your Zest app!</h2>
            <p className="text-muted-foreground">Start building your amazing application.</p>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
`;
  }

  await fs.writeFile(path.join(srcPath, "App.tsx"), appTsxContent);
}

async function createStyleFiles(srcPath: string): Promise<void> {
  const indexCssContent = `@import "tailwindcss";

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}

* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-feature-settings: "rlig" 1, "calt" 1;
}

.bg-background {
  background-color: hsl(var(--background));
}
.bg-foreground {
  background-color: hsl(var(--foreground));
}
.bg-card {
  background-color: hsl(var(--card));
}
.bg-card-foreground {
  background-color: hsl(var(--card-foreground));
}
.bg-popover {
  background-color: hsl(var(--popover));
}
.bg-popover-foreground {
  background-color: hsl(var(--popover-foreground));
}
.bg-primary {
  background-color: hsl(var(--primary));
}
.bg-primary-foreground {
  background-color: hsl(var(--primary-foreground));
}
.bg-secondary {
  background-color: hsl(var(--secondary));
}
.bg-secondary-foreground {
  background-color: hsl(var(--secondary-foreground));
}
.bg-muted {
  background-color: hsl(var(--muted));
}
.bg-muted-foreground {
  background-color: hsl(var(--muted-foreground));
}
.bg-accent {
  background-color: hsl(var(--accent));
}
.bg-accent-foreground {
  background-color: hsl(var(--accent-foreground));
}
.bg-destructive {
  background-color: hsl(var(--destructive));
}
.bg-destructive-foreground {
  background-color: hsl(var(--destructive-foreground));
}

.text-background {
  color: hsl(var(--background));
}
.text-foreground {
  color: hsl(var(--foreground));
}
.text-card {
  color: hsl(var(--card));
}
.text-card-foreground {
  color: hsl(var(--card-foreground));
}
.text-popover {
  color: hsl(var(--popover));
}
.text-popover-foreground {
  color: hsl(var(--popover-foreground));
}
.text-primary {
  color: hsl(var(--primary));
}
.text-primary-foreground {
  color: hsl(var(--primary-foreground));
}
.text-secondary {
  color: hsl(var(--secondary));
}
.text-secondary-foreground {
  color: hsl(var(--secondary-foreground));
}
.text-muted {
  color: hsl(var(--muted));
}
.text-muted-foreground {
  color: hsl(var(--muted-foreground));
}
.text-accent {
  color: hsl(var(--accent));
}
.text-accent-foreground {
  color: hsl(var(--accent-foreground));
}
.text-destructive {
  color: hsl(var(--destructive));
}
.text-destructive-foreground {
  color: hsl(var(--destructive-foreground));
}

.border-background {
  border-color: hsl(var(--background));
}
.border-foreground {
  border-color: hsl(var(--foreground));
}
.border-card {
  border-color: hsl(var(--card));
}
.border-card-foreground {
  border-color: hsl(var(--card-foreground));
}
.border-popover {
  border-color: hsl(var(--popover));
}
.border-popover-foreground {
  border-color: hsl(var(--popover-foreground));
}
.border-primary {
  border-color: hsl(var(--primary));
}
.border-primary-foreground {
  border-color: hsl(var(--primary-foreground));
}
.border-secondary {
  border-color: hsl(var(--secondary));
}
.border-secondary-foreground {
  border-color: hsl(var(--secondary-foreground));
}
.border-muted {
  border-color: hsl(var(--muted));
}
.border-muted-foreground {
  border-color: hsl(var(--muted-foreground));
}
.border-accent {
  border-color: hsl(var(--accent));
}
.border-accent-foreground {
  border-color: hsl(var(--accent-foreground));
}
.border-destructive {
  border-color: hsl(var(--destructive));
}
.border-destructive-foreground {
  border-color: hsl(var(--destructive-foreground));
}
.border-input {
  border-color: hsl(var(--input));
}

.ring-background {
  --tw-ring-color: hsl(var(--background));
}
.ring-foreground {
  --tw-ring-color: hsl(var(--foreground));
}
.ring-card {
  --tw-ring-color: hsl(var(--card));
}
.ring-card-foreground {
  --tw-ring-color: hsl(var(--card-foreground));
}
.ring-popover {
  --tw-ring-color: hsl(var(--popover));
}
.ring-popover-foreground {
  --tw-ring-color: hsl(var(--popover-foreground));
}
.ring-primary {
  --tw-ring-color: hsl(var(--primary));
}
.ring-primary-foreground {
  --tw-ring-color: hsl(var(--primary-foreground));
}
.ring-secondary {
  --tw-ring-color: hsl(var(--secondary));
}
.ring-secondary-foreground {
  --tw-ring-color: hsl(var(--secondary-foreground));
}
.ring-muted {
  --tw-ring-color: hsl(var(--muted));
}
.ring-muted-foreground {
  --tw-ring-color: hsl(var(--muted-foreground));
}
.ring-accent {
  --tw-ring-color: hsl(var(--accent));
}
.ring-accent-foreground {
  --tw-ring-color: hsl(var(--accent-foreground));
}
.ring-destructive {
  --tw-ring-color: hsl(var(--destructive));
}
.ring-destructive-foreground {
  --tw-ring-color: hsl(var(--destructive-foreground));
}
.ring-ring {
  --tw-ring-color: hsl(var(--ring));
}
`;

  await fs.writeFile(path.join(srcPath, "index.css"), indexCssContent);
}

async function createAuthFiles(srcPath: string): Promise<void> {
  const authPath = path.join(srcPath, "auth");
  await fs.ensureDir(authPath);

  // Create Auth.ts
  const authContent = `import { ExampleVersion1000CultureNeutralPublicKeyTokenNull as AuthService } from "../generated/client";
import { configureAuth } from "@ludovikallen/zest/AuthContext.tsx";

const auth = configureAuth(AuthService);

export const useAuth = auth.useAuth;
export const AuthProvider = auth.AuthProvider;
`;
  await fs.writeFile(path.join(authPath, "Auth.ts"), authContent);

  // Create AuthContainer.tsx
  const authContainerContent = `import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

const AuthContainer = () => {
  const [view, setView] = useState<"login" | "register">("login");

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {view === "login" ? <Login /> : <Register />}
      <div className="text-center">
        {view === "login" ? (
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              onClick={() => setView("register")}
            >
              Sign up
            </button>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              onClick={() => setView("login")}
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthContainer;`;

  await fs.writeFile(
    path.join(authPath, "AuthContainer.tsx"),
    authContainerContent
  );

  // Create Login.tsx
  const loginContent = `import { useState } from "react";
import { useAuth } from "./Auth.ts";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await login(email, password);
      if (response.error) {
        setError("An error happened during the login.");
      }
    }
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
        <div className="flex flex-col space-y-2 text-center mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter your password"
            />
          </div>
          {error && (
            <div className="text-sm font-medium text-destructive text-center">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;`;

  await fs.writeFile(path.join(authPath, "Login.tsx"), loginContent);

  // Create Register.tsx
  const registerContent = `import { useState } from "react";
import { useAuth } from "./Auth.ts";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setIsSubmitting(true);

    try {
      const response = await register(email, password);
      if (response.error) {
        setError("An error happened during the register.");
      } else {
        await login(email, password);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
        <div className="flex flex-col space-y-2 text-center mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Create an account</h2>
          <p className="text-sm text-muted-foreground">
            Enter your email below to create your account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Create a password"
            />
          </div>
          {error && (
            <div className="text-sm font-medium text-destructive text-center">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;`;

  await fs.writeFile(path.join(authPath, "Register.tsx"), registerContent);
}

async function createPublicFiles(frontendPath: string): Promise<void> {
  const publicPath = path.join(frontendPath, "public");
  await fs.ensureDir(publicPath);

  // Create vite.svg
  const viteSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>`;

  await fs.writeFile(path.join(publicPath, "vite.svg"), viteSvgContent);
}

async function createEslintConfig(frontendPath: string): Promise<void> {
  const eslintConfigContent = `import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)`;

  await fs.writeFile(
    path.join(frontendPath, "eslint.config.js"),
    eslintConfigContent
  );
}

async function createVSCodeConfig(frontendPath: string): Promise<void> {
  const vscodePath = path.join(frontendPath, ".vscode");
  await fs.ensureDir(vscodePath);

  const launchJsonContent = `{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "edge",
      "request": "launch",
      "name": "localhost (Edge)",
      "url": "http://localhost:5173",
      "webRoot": "\${workspaceFolder}"
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "localhost (Chrome)",
      "url": "http://localhost:5173",
      "webRoot": "\${workspaceFolder}"
    }
  ]
}`;

  await fs.writeFile(path.join(vscodePath, "launch.json"), launchJsonContent);
}

async function createEnvironmentFiles(
  frontendPath: string,
  docker: boolean
): Promise<void> {
  // Always create .env.development
  const envDevelopmentContent = `VITE_API_BASE_URL=http://localhost:5226`;
  await fs.writeFile(
    path.join(frontendPath, ".env.development"),
    envDevelopmentContent
  );

  // Only create .env when docker option is enabled
  if (docker) {
    const envContent = `VITE_API_BASE_URL=ZEST_API_BASE_URL`;
    await fs.writeFile(path.join(frontendPath, ".env"), envContent);
  }
}

async function createComponents(
  srcPath: string,
  useAuth: boolean,
  todo?: boolean
): Promise<void> {
  const componentsPath = path.join(srcPath, "components");
  await fs.ensureDir(componentsPath);

  await createThemeToggle(componentsPath);

  if (todo) {
    await createTodoPage(componentsPath, useAuth);
  }
}

async function createThemeToggle(componentsPath: string): Promise<void> {
  const themeToggleContent = `import { useTheme } from '../contexts/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 p-2 rounded-lg bg-card hover:bg-accent border border-border transition-colors duration-200 shadow-sm"
      aria-label={\`Switch to \${theme === 'light' ? 'dark' : 'light'} mode\`}
    >
      {theme === 'light' ? (
        // Moon icon for dark mode
        <svg
          className="w-5 h-5 text-foreground"
          fill="none"
          strokeWidth={2}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      ) : (
        // Sun icon for light mode
        <svg
          className="w-5 h-5 text-foreground"
          fill="none"
          strokeWidth={2}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      )}
    </button>
  );
}`;

  await fs.writeFile(
    path.join(componentsPath, "ThemeToggle.tsx"),
    themeToggleContent
  );
}

async function createTodoPage(
  componentsPath: string,
  useAuth: boolean
): Promise<void> {
  // Create TodoPage.tsx
  let todoPageContent;
  if (useAuth) {
    todoPageContent = `import { useEffect, useState } from "react";
import { type TodoReadable, type CreateTodoRequest, Todo } from "../generated/client";
import { useAuth } from "../auth/Auth.ts";

const TodoPage = () => {
  const [todos, setTodos] = useState<TodoReadable[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState<CreateTodoRequest>({ title: "", description: "" });
  const { state, logout } = useAuth();

  const loadTodos = async () => {
    setLoading(true);
    try {
      const response = await Todo.getTodos();
      if (response.error) {
        console.log(response.error);
      } else if (response.data) {
        setTodos(response.data);
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async () => {
    if (!newTodo.title?.trim()) return;
    try {
      const response = await Todo.createTodo({ body: newTodo });
      if (response.error) {
        console.log(response.error);
      } else if (response.data) {
        setTodos(prev => [...prev, response.data]);
        setNewTodo({ title: "", description: "" });
      }
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      setTodos(prev => prev.filter(todo => todo.id !== id));
      const response = await Todo.deleteTodo({ path: { id } });
      if (response.error) {
        console.log(response.error);
        loadTodos();
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
      loadTodos();
    }
  };

  const toggleTodoStatus = async (todo: TodoReadable) => {
    const newStatus = todo.status === 0 ? 1 : 0;
    try {
      setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, status: newStatus } : t));
      const response = await Todo.updateTodo({
        path: { id: todo.id },
        body: {
          title: todo.title,
          description: todo.description,
          status: newStatus
        }
      });
      if (response.error) {
        console.log(response.error);
        loadTodos();
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
      loadTodos();
    }
  };

  useEffect(() => {
    if (state.isAuthenticated) {
      loadTodos();
    }
  }, [state.isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading your todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="p-6 pb-4">
          <div className="flex flex-col space-y-1.5">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">Your Todos</h2>
            <p className="text-sm text-muted-foreground">
              Manage your tasks and stay productive
            </p>
          </div>
        </div>

        <div className="p-6 pt-0">
          {/* Add new todo form */}
          <form
            className="flex flex-col sm:flex-row gap-3 mb-6"
            onSubmit={e => { e.preventDefault(); createTodo(); }}
          >
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTodo.title || ""}
              onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
            />
            <input
              type="text"
              placeholder="Add a description (optional)"
              value={newTodo.description || ""}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
            />
            <button
              type="submit"
              disabled={!newTodo.title?.trim()}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shrink-0"
            >
              Add Todo
            </button>
          </form>

          {todos.length > 0 ? (
            <div className="space-y-3">
              {todos.map(todo => (
                <div
                  key={todo.id}
                  className={"rounded-lg border p-4 transition-colors"}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox for completion */}
                    <div className="flex items-center mt-1">
                      <input
                        title="Toggle todo status"
                        type="checkbox"
                        checked={todo.status === 1}
                        onChange={() => toggleTodoStatus(todo)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                    
                    {/* Todo content */}
                    <div className="flex-1 space-y-1">
                      <h3 className={\`font-medium leading-none \${
                        todo.status === 1 ? 'line-through text-muted-foreground' : 'text-foreground'
                      }\`}>
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className={\`text-sm \${
                          todo.status === 1 ? 'line-through text-muted-foreground/60' : 'text-muted-foreground'
                        }\`}>
                          {todo.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(todo.createdDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 hover:text-red-700 transition-colors group"
                      title="Delete todo"
                    >
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12" 
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No todos yet. Create your first one above!</p>
            </div>
          )}
        </div>

        <div className="p-6 pt-0">
          <button
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
            onClick={logout}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoPage;
`;
  } else {
    todoPageContent = `import { useEffect, useState } from "react";
import { type TodoReadable, type CreateTodoRequest, Todo } from "../generated/client";

const TodoPage = () => {
  const [todos, setTodos] = useState<TodoReadable[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState<CreateTodoRequest>({ title: "", description: "" });

  const loadTodos = async () => {
    setLoading(true);
    try {
      const response = await Todo.getTodos();
      if (response.error) {
        console.log(response.error);
      } else if (response.data) {
        setTodos(response.data);
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async () => {
    if (!newTodo.title?.trim()) return;
    try {
      const response = await Todo.createTodo({ body: newTodo });
      if (response.error) {
        console.log(response.error);
      } else if (response.data) {
        setTodos(prev => [...prev, response.data]);
        setNewTodo({ title: "", description: "" });
      }
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      setTodos(prev => prev.filter(todo => todo.id !== id));
      const response = await Todo.deleteTodo({ path: { id } });
      if (response.error) {
        console.log(response.error);
        loadTodos();
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
      loadTodos();
    }
  };

  const toggleTodoStatus = async (todo: TodoReadable) => {
    const newStatus = todo.status === 0 ? 1 : 0;
    try {
      setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, status: newStatus } : t));
      const response = await Todo.updateTodo({
        path: { id: todo.id },
        body: {
          title: todo.title,
          description: todo.description,
          status: newStatus
        }
      });
      if (response.error) {
        console.log(response.error);
        loadTodos();
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
      loadTodos();
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading your todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="p-6 pb-4">
          <div className="flex flex-col space-y-1.5">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">Your Todos</h2>
            <p className="text-sm text-muted-foreground">
              Manage your tasks and stay productive
            </p>
          </div>
        </div>

        <div className="p-6 pt-0">
          {/* Add new todo form */}
          <form
            className="flex flex-col sm:flex-row gap-3 mb-6"
            onSubmit={e => { e.preventDefault(); createTodo(); }}
          >
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTodo.title || ""}
              onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
            />
            <input
              type="text"
              placeholder="Add a description (optional)"
              value={newTodo.description || ""}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
            />
            <button
              type="submit"
              disabled={!newTodo.title?.trim()}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shrink-0"
            >
              Add Todo
            </button>
          </form>

          {todos.length > 0 ? (
            <div className="space-y-3">
              {todos.map(todo => (
                <div
                  key={todo.id}
                  className={"rounded-lg border p-4 transition-colors"}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox for completion */}
                    <div className="flex items-center mt-1">
                      <input
                        title="Toggle todo status"
                        type="checkbox"
                        checked={todo.status === 1}
                        onChange={() => toggleTodoStatus(todo)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                    
                    {/* Todo content */}
                    <div className="flex-1 space-y-1">
                      <h3 className={\`font-medium leading-none \${
                        todo.status === 1 ? 'line-through text-muted-foreground' : 'text-foreground'
                      }\`}>
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className={\`text-sm \${
                          todo.status === 1 ? 'line-through text-muted-foreground/60' : 'text-muted-foreground'
                        }\`}>
                          {todo.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(todo.createdDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 hover:text-red-700 transition-colors group"
                      title="Delete todo"
                    >
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12" 
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No todos yet. Create your first one above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoPage;
`;
  }

  await fs.writeFile(
    path.join(componentsPath, "TodoPage.tsx"),
    todoPageContent
  );
}

async function createContexts(srcPath: string): Promise<void> {
  const contextsPath = path.join(srcPath, "contexts");
  await fs.ensureDir(contextsPath);

  await createThemeContextType(contextsPath);
  await createThemeContext(contextsPath);
  await createUseTheme(contextsPath);
}

async function createThemeContext(contextsPath: string): Promise<void> {
  const themeContextContent = `import React, { useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContextCore';

type Theme = 'light' | 'dark';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
`;
  await fs.writeFile(
    path.join(contextsPath, "ThemeContext.tsx"),
    themeContextContent
  );
}

async function createThemeContextType(contextsPath: string): Promise<void> {
  const themeContextTypeContent = `import { createContext } from "react";

type Theme = "light" | "dark";

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);
`;
  await fs.writeFile(
    path.join(contextsPath, "ThemeContextCore.ts"),
    themeContextTypeContent
  );
}

async function createUseTheme(contextsPath: string): Promise<void> {
  const themeContextContent = `import { useContext } from "react";
import { ThemeContext, type ThemeContextType } from "./ThemeContextCore";

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
`;
  await fs.writeFile(
    path.join(contextsPath, "useTheme.ts"),
    themeContextContent
  );
}
