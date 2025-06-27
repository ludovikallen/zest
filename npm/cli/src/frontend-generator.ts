import fs from 'fs-extra';
import path from 'path';
import type { ProjectOptions } from './types.js';

export async function createFrontendFiles(projectPath: string, options: ProjectOptions): Promise<void> {
  const { projectName, packageManager, useAuth, docker } = options;
  const frontendPath = path.join(projectPath, 'frontend');
  
  await fs.ensureDir(frontendPath);

  // Create package.json
  const packageJsonContent = {
    name: "frontend",
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "tsc -b && vite build",
      lint: "eslint .",
      preview: "vite preview"
    },
    dependencies: {
      react: "^19.1.0",
      "@ludovikallen/zest": "0.0.1",
      "react-dom": "^19.1.0"
    },
    devDependencies: {
      "@types/react": "^19.1.2",
      "@types/react-dom": "^19.1.2",
      "@vitejs/plugin-react-swc": "^3.9.0",
      typescript: "~5.8.3",
      vite: "^6.3.5",
      "@eslint/js": "^9.25.0",
      eslint: "^9.25.0",
      "eslint-plugin-react-hooks": "^5.2.0",
      "eslint-plugin-react-refresh": "^0.4.19",
      globals: "^16.0.0",
      "typescript-eslint": "^8.30.1"
    }
  };

  await fs.writeFile(
    path.join(frontendPath, 'package.json'), 
    JSON.stringify(packageJsonContent, null, 2)
  );

  // Create esproj file
  const esprojContent = `<Project Sdk="Microsoft.VisualStudio.JavaScript.Sdk/1.0.586930">
    <PropertyGroup>
        <StartupCommand>${packageManager} run dev</StartupCommand>
    </PropertyGroup>
</Project>`;

  await fs.writeFile(path.join(frontendPath, `${projectName.toLowerCase()}.frontend.esproj`), esprojContent);

  // Create vite.config.ts
  const viteConfigContent = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
`;

  await fs.writeFile(path.join(frontendPath, 'vite.config.ts'), viteConfigContent);

  // Create TypeScript config files
  await createTypeScriptConfigs(frontendPath);
  
  // Create index.html
  await createIndexHtml(frontendPath, projectName);
  
  // Create src directory and files
  await createSourceFiles(frontendPath, projectName, useAuth);
  
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

  await fs.writeFile(path.join(frontendPath, 'tsconfig.json'), tsconfigContent);

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
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}`;

  await fs.writeFile(path.join(frontendPath, 'tsconfig.app.json'), tsconfigAppContent);

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
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}`;

  await fs.writeFile(path.join(frontendPath, 'tsconfig.node.json'), tsconfigNodeContent);
}

async function createIndexHtml(frontendPath: string, projectName: string): Promise<void> {
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
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

  await fs.writeFile(path.join(frontendPath, 'index.html'), indexHtmlContent);
}

async function createSourceFiles(frontendPath: string, projectName: string, useAuth: boolean): Promise<void> {
  const srcPath = path.join(frontendPath, 'src');
  await fs.ensureDir(srcPath);

  // Create main.tsx
  const mainTsxContent = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`;

  await fs.writeFile(path.join(srcPath, 'main.tsx'), mainTsxContent);

  // Create App.tsx based on features
  await createAppComponent(srcPath, projectName, useAuth);
  
  // Create CSS files
  await createStyleFiles(srcPath);

  // Create vite-env.d.ts
  const viteEnvContent = `/// <reference types="vite/client" />`;
  await fs.writeFile(path.join(srcPath, 'vite-env.d.ts'), viteEnvContent);

  // Create auth files if authentication is enabled
  if (useAuth) {
    await createAuthFiles(srcPath);
  }
}

async function createAppComponent(srcPath: string, projectName: string, useAuth: boolean): Promise<void> {
  let appTsxContent = '';
  
  if (useAuth) {
    appTsxContent = `import AuthContainer from './auth/AuthContainer'
import Weather from './auth/Weather'
import './auth/Auth.css'
import './App.css'

import { ${projectName}Version1000CultureNeutralPublicKeyTokenNull as AuthService } from "./generated/client";
import {configureAuth} from "@ludovikallen/zest/AuthContext.tsx";

const auth = configureAuth(AuthService);

export const useAuth = auth.useAuth;
export const AuthProvider = auth.AuthProvider;

function AppContent() {
    const { state } = useAuth();

    return state.isAuthenticated ? <Weather /> : <AuthContainer />;
}

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <h1>${projectName} App</h1>
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App`;
  } else {
    appTsxContent = `import { useState, useEffect } from 'react'
import './App.css'

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

function App() {
  const [weather, setWeather] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch weather data from your API
    fetch('/weatherforecast')
      .then(response => response.json())
      .then(data => {
        setWeather(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="app-container">
        <h1>${projectName} App</h1>
        <div style={{ color: "#333333" }}>Loading weather data...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1>${projectName} App</h1>
      <div className="weather-container" style={{ color: "#333333" }}>
        <h2 style={{ color: "#333333" }}>Weather Forecast</h2>

        {weather.length > 0 ? (
          <table className="weather-table">
            <thead>
              <tr>
                <th style={{ color: "#333333" }}>Date</th>
                <th style={{ color: "#333333" }}>Summary</th>
                <th style={{ color: "#333333" }}>Temp (C)</th>
              </tr>
            </thead>
            <tbody>
              {weather.map((item, index) => (
                <tr key={index}>
                  <td style={{ color: "#333333" }}>{item.date}</td>
                  <td style={{ color: "#333333" }}>{item.summary || "-"}</td>
                  <td style={{ color: "#333333" }}>{item.temperatureC}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: "#333333" }}>No weather data available</p>
        )}
      </div>
    </div>
  );
}

export default App`;
  }

  await fs.writeFile(path.join(srcPath, 'App.tsx'), appTsxContent);
}

async function createStyleFiles(srcPath: string): Promise<void> {
  const appCssContent = `#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  color: #333333; /* Adding text color */
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}

.app-container {
  color: #333333;
}

h1, h2, h3, h4, h5, h6 {
  color: #333333;
}

p, span, div {
  color: #333333;
}

.weather-container {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  color: #333333;
}

table {
  color: #333333;
}`;

  await fs.writeFile(path.join(srcPath, 'App.css'), appCssContent);

  const indexCssContent = `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  color: white;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
    color: #213547;
  }
}`;

  await fs.writeFile(path.join(srcPath, 'index.css'), indexCssContent);
}

async function createAuthFiles(srcPath: string): Promise<void> {
  const authPath = path.join(srcPath, 'auth');
  await fs.ensureDir(authPath);

  // Create auth CSS
  const authCssContent = `.auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  color: #333333; /* Adding text color */
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333333; /* Adding label text color */
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  color: #333333; /* Adding input text color */
  background-color: #ffffff; /* Ensuring input background is white */
}

.error-message {
  color: #d32f2f;
  margin: 10px 0;
  font-size: 14px;
}

button {
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #1565c0;
}

button:disabled {
  background-color: #bdbdbd;
  cursor: not-allowed;
}

.link-button {
  background: none;
  border: none;
  color: #1976d2;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
}

.link-button:hover {
  background: none;
  color: #1565c0;
}

.auth-toggle {
  margin-top: 15px;
  text-align: center;
  color: #333333; /* Adding text color for the toggle messages */
}

.user-info {
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #333333; /* Adding text color */
}

.weather-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.weather-table th,
.weather-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
  color: #333333; /* Adding text color for table content */
}

.weather-table th {
  background-color: #f2f2f2;
}

.logout-button {
  margin-top: 20px;
}

/* Additional styles to ensure text visibility */
h1, h2, h3, h4, h5, h6, p {
  color: #333333;
}

.weather-container {
  color: #333333;
}`;

  await fs.writeFile(path.join(authPath, 'Auth.css'), authCssContent);

  // Create AuthContainer.tsx
  const authContainerContent = `import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

const AuthContainer = () => {
  const [view, setView] = useState<"login" | "register">("login");

  return (
    <div className="auth-container">
      {view === "login" ? <Login /> : <Register />}

      <div className="auth-toggle">
        {view === "login" ? (
          <p>
            Don't have an account?{" "}
            <button
              className="link-button"
              onClick={() => setView("register")}
            >
              Register now
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <button
              className="link-button"
              onClick={() => setView("login")}
            >
              Login
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthContainer;`;

  await fs.writeFile(path.join(authPath, 'AuthContainer.tsx'), authContainerContent);

  // Create Login.tsx
  const loginContent = `import { useState } from "react";
import {useAuth} from "../App.tsx";

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
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;`;

  await fs.writeFile(path.join(authPath, 'Login.tsx'), loginContent);

  // Create Register.tsx
  const registerContent = `import { useState } from "react";
import {useAuth} from "../App.tsx";

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
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;`;

  await fs.writeFile(path.join(authPath, 'Register.tsx'), registerContent);

  // Create Weather.tsx
  const weatherContent = `import { useEffect, useState } from "react";
import { type WeatherForecastReadable, WeatherForecast } from "../generated/client";
import "../App.css";
import { useAuth } from "../App.tsx";

const Weather = () => {
  const [weather, setWeather] = useState<WeatherForecastReadable[]>([]);
  const [loading, setLoading] = useState(true);
  const { state, logout } = useAuth();

  useEffect(() => {
    if (state.isAuthenticated) {
      setLoading(true);
      WeatherForecast.getWeatherForecast().then(x => {
        if (x.error) {
          console.log(x.error);
        } else if (x.data) {
          setWeather(x.data);
        }
        setLoading(false);
      });
    }
  }, [state.isAuthenticated]);

  if (loading) {
    return <div style={{ color: "#333333" }}>Loading weather data...</div>;
  }

  return (
    <div className="weather-container" style={{ color: "#333333" }}>
      <h2 style={{ color: "#333333" }}>Weather Forecast</h2>

      <div className="user-info">
        <h3 style={{ color: "#333333" }}>User Information</h3>
        <p><strong style={{ color: "#333333" }}>Email:</strong> <span style={{ color: "#333333" }}>{state.user?.email}</span></p>
        <p><strong style={{ color: "#333333" }}>Email Confirmed:</strong> <span style={{ color: "#333333" }}>{state.user?.isEmailConfirmed ? "Yes" : "No"}</span></p>
      </div>

      {weather.length > 0 ? (
        <table className="weather-table">
          <thead>
            <tr>
              <th style={{ color: "#333333" }}>Date</th>
              <th style={{ color: "#333333" }}>Summary</th>
              <th style={{ color: "#333333" }}>Temp (C)</th>
            </tr>
          </thead>
          <tbody>
            {weather.map(x => (
              <tr key={x.date}>
                <td style={{ color: "#333333" }}>{x.date}</td>
                <td style={{ color: "#333333" }}>{x.summary || "-"}</td>
                <td style={{ color: "#333333" }}>{x.temperatureC}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: "#333333" }}>No weather data available</p>
      )}

      <button className="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

export default Weather;`;

  await fs.writeFile(path.join(authPath, 'Weather.tsx'), weatherContent);
}

async function createPublicFiles(frontendPath: string): Promise<void> {
  const publicPath = path.join(frontendPath, 'public');
  await fs.ensureDir(publicPath);

  // Create vite.svg
  const viteSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>`;

  await fs.writeFile(path.join(publicPath, 'vite.svg'), viteSvgContent);
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

  await fs.writeFile(path.join(frontendPath, 'eslint.config.js'), eslintConfigContent);
}

async function createVSCodeConfig(frontendPath: string): Promise<void> {
  const vscodePath = path.join(frontendPath, '.vscode');
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

  await fs.writeFile(path.join(vscodePath, 'launch.json'), launchJsonContent);
}

async function createEnvironmentFiles(frontendPath: string, docker: boolean): Promise<void> {
  // Always create .env.development
  const envDevelopmentContent = `VITE_API_BASE_URL=http://localhost:5226`;
  await fs.writeFile(path.join(frontendPath, '.env.development'), envDevelopmentContent);

  // Only create .env when docker option is enabled
  if (docker) {
    const envContent = `VITE_API_BASE_URL=ZEST_API_BASE_URL`;
    await fs.writeFile(path.join(frontendPath, '.env'), envContent);
  }
}
