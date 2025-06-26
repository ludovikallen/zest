import fs from 'fs-extra';
import path from 'path';
export async function createFrontendFiles(projectPath, options) {
    const { projectName, packageManager, features, useAuth } = options;
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
            lint: features.includes('eslint') ? "eslint ." : undefined,
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
            ...(features.includes('eslint') && {
                "@eslint/js": "^9.25.0",
                eslint: "^9.25.0",
                "eslint-plugin-react-hooks": "^5.2.0",
                "eslint-plugin-react-refresh": "^0.4.19",
                globals: "^16.0.0",
                "typescript-eslint": "^8.30.1"
            })
        }
    };
    // Remove undefined values
    if (packageJsonContent.scripts.lint === undefined) {
        delete packageJsonContent.scripts.lint;
    }
    await fs.writeFile(path.join(frontendPath, 'package.json'), JSON.stringify(packageJsonContent, null, 2));
    // Create esproj file
    const esprojContent = `<Project Sdk="Microsoft.VisualStudio.JavaScript.Sdk/1.0.0">
  <PropertyGroup>
    <StartupCommand>${packageManager} run dev</StartupCommand>
    <JavaScriptTestFramework>Node</JavaScriptTestFramework>
  </PropertyGroup>
</Project>`;
    await fs.writeFile(path.join(frontendPath, `${projectName.toLowerCase()}.client.esproj`), esprojContent);
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
    await createSourceFiles(frontendPath, projectName, features, useAuth);
    // Create public directory
    await createPublicFiles(frontendPath);
    // Create ESLint config if selected
    if (features.includes('eslint')) {
        await createEslintConfig(frontendPath);
    }
}
async function createTypeScriptConfigs(frontendPath) {
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
async function createIndexHtml(frontendPath, projectName) {
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
async function createSourceFiles(frontendPath, projectName, features, useAuth) {
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
    await createAppComponent(srcPath, projectName, features, useAuth);
    // Create CSS files
    await createStyleFiles(srcPath);
    // Create vite-env.d.ts
    const viteEnvContent = `/// <reference types="vite/client" />`;
    await fs.writeFile(path.join(srcPath, 'vite-env.d.ts'), viteEnvContent);
    // Create auth files if authentication is enabled
    if (useAuth) {
        await createAuthFiles(srcPath, features);
    }
}
async function createAppComponent(srcPath, projectName, features, useAuth) {
    let appTsxContent = '';
    if (useAuth && features.includes('weather')) {
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
    }
    else if (features.includes('weather')) {
        appTsxContent = `import { useState, useEffect } from 'react'
import './App.css'

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

function App() {
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/weatherforecast')
      .then(response => response.json())
      .then(data => {
        setForecasts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="app-container">
      <h1>${projectName} Weather App</h1>
      {loading ? (
        <p>Loading weather data...</p>
      ) : (
        <div className="weather-container">
          {forecasts.map((forecast, index) => (
            <div key={index} className="weather-card">
              <h3>{forecast.date}</h3>
              <p>Temperature: {forecast.temperatureC}°C ({forecast.temperatureF}°F)</p>
              <p>Summary: {forecast.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App`;
    }
    else {
        appTsxContent = `import './App.css'

function App() {
  return (
    <div className="app-container">
      <h1>Welcome to ${projectName}!</h1>
      <p>Your Zest application is ready to go!</p>
    </div>
  );
}

export default App`;
    }
    await fs.writeFile(path.join(srcPath, 'App.tsx'), appTsxContent);
}
async function createStyleFiles(srcPath) {
    const appCssContent = `.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.weather-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.weather-card {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
async function createAuthFiles(srcPath, features) {
    const authPath = path.join(srcPath, 'auth');
    await fs.ensureDir(authPath);
    // Create auth CSS
    const authCssContent = `.auth-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-form input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.auth-form button {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background: #007bff;
  color: white;
  cursor: pointer;
}

.auth-form button:hover {
  background: #0056b3;
}

.auth-toggle {
  margin-top: 1rem;
  text-align: center;
}

.auth-toggle button {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
}`;
    await fs.writeFile(path.join(authPath, 'Auth.css'), authCssContent);
    // Create AuthContainer.tsx
    const authContainerContent = `import { useState } from 'react';
import { useAuth } from '../App';

const AuthContainer = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password);
            }
        } catch (error) {
            console.error('Authentication error:', error);
        }
    };

    return (
        <div className="auth-container">
            <h2>{isLogin ? 'Login' : 'Register'}</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">
                    {isLogin ? 'Login' : 'Register'}
                </button>
            </form>
            <div className="auth-toggle">
                <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {isLogin ? 'Need to register?' : 'Already have an account?'}
                </button>
            </div>
        </div>
    );
};

export default AuthContainer;`;
    await fs.writeFile(path.join(authPath, 'AuthContainer.tsx'), authContainerContent);
    // Create Weather.tsx if weather feature is included
    if (features.includes('weather')) {
        const weatherContent = `import { useState, useEffect } from 'react';
import { useAuth } from '../App';

interface WeatherForecast {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}

const Weather = () => {
    const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();

    useEffect(() => {
        fetch('/weatherforecast')
            .then(response => response.json())
            .then(data => {
                setForecasts(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Weather Forecast</h2>
                <button onClick={logout}>Logout</button>
            </div>
            {loading ? (
                <p>Loading weather data...</p>
            ) : (
                <div className="weather-container">
                    {forecasts.map((forecast, index) => (
                        <div key={index} className="weather-card">
                            <h3>{forecast.date}</h3>
                            <p>Temperature: {forecast.temperatureC}°C ({forecast.temperatureF}°F)</p>
                            <p>Summary: {forecast.summary}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Weather;`;
        await fs.writeFile(path.join(authPath, 'Weather.tsx'), weatherContent);
    }
}
async function createPublicFiles(frontendPath) {
    const publicPath = path.join(frontendPath, 'public');
    await fs.ensureDir(publicPath);
    // Create vite.svg
    const viteSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>`;
    await fs.writeFile(path.join(publicPath, 'vite.svg'), viteSvgContent);
}
async function createEslintConfig(frontendPath) {
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
//# sourceMappingURL=frontend-generator.js.map