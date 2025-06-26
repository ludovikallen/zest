export interface ProjectOptions {
  projectName: string;
  useAuth: boolean;
  docker: boolean;
  database: 'inmemory' | 'sqlite' | 'postgresql';
  packageManager: 'npm' | 'yarn' | 'pnpm';
}

export interface DotNetVersionChoice {
  name: string;
  value: string;
}