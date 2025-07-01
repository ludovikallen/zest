export interface ProjectOptions {
  projectName: string;
  useAuth: boolean;
  docker: boolean;
  database: "inmemory" | "sqlite" | "postgresql";
  packageManager: "npm" | "yarn" | "pnpm";
  skipSetup?: boolean;
}
