export interface ProjectOptions {
  projectName: string;
  useAuth: boolean;
  features: string[];
  packageManager: 'npm' | 'yarn' | 'pnpm';
}

export interface FeatureChoice {
  name: string;
  value: string;
}

export interface DotNetVersionChoice {
  name: string;
  value: string;
}

export const AVAILABLE_FEATURES: FeatureChoice[] = [
  { name: 'Weather API Example', value: 'weather' },
  { name: 'Entity Framework In-Memory Database', value: 'efcore' },
  { name: 'Swagger/OpenAPI Documentation', value: 'swagger' },
  { name: 'Docker Support', value: 'docker' },
  { name: 'ESLint Configuration', value: 'eslint' },
];