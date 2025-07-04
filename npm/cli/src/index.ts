#!/usr/bin/env node

import { input, select, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { exec } from "child_process";
import { promisify } from "util";
import ora from "ora";
import type { ProjectOptions } from "./types.js";
import { createBackendFiles } from "./backend-generator.js";
import { createFrontendFiles } from "./frontend-generator.js";
import { createAdditionalFiles } from "./file-generator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

// Helper function to execute commands with spinner
async function execWithSpinner(
  message: string,
  command: string,
  options: any = {}
) {
  const spinner = ora(message).start();
  try {
    const result = await execAsync(command, {
      cwd: process.cwd(),
      shell: "pwsh.exe",
      ...options,
    });
    spinner.succeed(message.replace(/\.\.\.$/, "") + " completed");
    return result;
  } catch (error) {
    spinner.fail(message.replace(/\.\.\.$/, "") + " failed");
    throw error;
  }
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .command("$0 [name]", "Create a new Zest application", (yargs) => {
      yargs.positional("name", {
        describe:
          "Name of the project to create using CamelCase (e.g., MyZestApp)",
        type: "string",
      });
      yargs.option("auth", {
        describe: "Include authentication",
        type: "boolean",
        default: false,
      });
      yargs.option("docker", {
        describe: "Include Docker files for deployment",
        type: "boolean",
        default: true,
      });
      yargs.option("database", {
        describe: "Database type",
        choices: ["sqlite", "postgresql", "inmemory"] as const,
        default: "sqlite" as const,
      });
      yargs.option("package-manager", {
        describe: "Package manager",
        choices: ["npm", "yarn", "pnpm"] as const,
        default: "npm" as const,
      });
      yargs.option("no-setup", {
        describe: "Skip automatic setup commands",
        type: "boolean",
        default: false,
      });
      yargs.option("todo", {
        describe: "Include todo functionality with sample CRUD API",
        type: "boolean",
        default: false,
      });
    })
    .usage("Usage: $0 [name] [options]")
    .example("$0", "Interactive mode")
    .example("$0 MyApp", "Create empty MyApp with default settings")
    .example("$0 MyApp --todo", "Create MyApp with todo functionality")
    .example(
      "$0 MyApp --auth --database postgresql",
      "Create MyApp with custom options"
    )
    .help()
    .alias("h", "help")
    .alias("v", "version").argv;

  let options: ProjectOptions;

  console.log(chalk.blue.bold("🚀 Welcome to create-zest!"));
  console.log(
    chalk.gray(
      "Create a new Zest application with .NET backend and React frontend.\n"
    )
  );

  // Check if name was provided - determines interactive vs flag mode
  const providedName = argv.name as string | undefined;
  const isInteractiveMode = !providedName;

  let projectName: string;

  if (isInteractiveMode) {
    // Interactive mode - prompt for everything including name
    projectName = await input({
      message: "What is the name of your project?",
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return "Project name is required";
        }
        if (!/^[A-Z][a-zA-Z]*$/.test(input.trim())) {
          return "Project name can only contain letters and must be in CamelCase (e.g., MyZestApp)";
        }
        return true;
      },
    });

    const useAuth = await confirm({
      message: "Do you want to include authentication?",
      default: true,
    });

    const todo = await confirm({
      message:
        "Do you want to include todo functionality with sample CRUD API?",
      default: false,
    });

    const docker = await confirm({
      message: "Do you want to include Docker files to deploy?",
      default: true,
    });

    const database = await select({
      message: "Select database:",
      choices: [
        { name: "sqlite", value: "sqlite" as const },
        {
          name: "postgresql",
          value: "postgresql" as const,
          description: "Requires Docker",
        },
        { name: "inmemory", value: "inmemory" as const },
      ],
      default: "sqlite",
    });

    const packageManager = await select({
      message: "Select package manager:",
      choices: [
        { name: "npm", value: "npm" as const },
        { name: "yarn", value: "yarn" as const },
        { name: "pnpm", value: "pnpm" as const },
      ],
      default: "npm",
    });

    const skipSetup = await confirm({
      message:
        "Do you want to skip the automatic setup commands after project creation?",
      default: false,
    });

    console.log("");

    options = {
      projectName: projectName.trim(),
      useAuth,
      todo,
      docker,
      database,
      packageManager,
      skipSetup,
    };
  } else {
    // Flag mode - validate name and use provided flags
    projectName = providedName;

    // Validate project name
    if (!projectName || projectName.trim().length === 0) {
      console.error(chalk.red("Project name is required"));
      process.exit(1);
    }
    if (!/^[A-Z][a-zA-Z]*$/.test(projectName)) {
      console.error(
        chalk.red(
          "Project name can only contain letters and must be in CamelCase (e.g., MyZestApp)"
        )
      );
      process.exit(1);
    }

    options = {
      projectName: projectName.trim(),
      useAuth: argv.auth as boolean,
      todo: argv.todo as boolean,
      docker: argv.docker as boolean,
      database: argv.database as "sqlite" | "postgresql" | "inmemory",
      packageManager: argv["package-manager"] as "npm" | "yarn" | "pnpm",
      skipSetup: argv["no-setup"] as boolean,
    };
  }

  // Create project with spinner
  const projectSpinner = ora("Creating your Zest application...").start();
  try {
    await createProject(options);
    projectSpinner.succeed("Project created successfully!");
  } catch (error) {
    projectSpinner.fail("Failed to create project");
    throw error;
  }

  // Build the command string
  const currentDir = process.cwd();
  const projectPath = path.join(currentDir, options.projectName);
  let setupCommands = [`cd ${projectPath}`];
  setupCommands.push(
    `cd frontend`,
    `${options.packageManager} install`,
    `cd ..`
  );
  if (options.database === "postgresql") {
    setupCommands.push("cd dev", "docker compose up -d", "cd ..");
  }

  if (options.database !== "inmemory") {
    setupCommands.push(
      "cd backend",
      "dotnet restore",
      "dotnet tool install --global dotnet-ef",
      "dotnet ef migrations add InitialCreate",
      "dotnet ef database update",
      "cd .."
    );
  } else {
    setupCommands.push("cd backend", "dotnet restore", "cd ..");
  }

  const commandString = setupCommands.join(" && ");

  if (options.skipSetup !== true) {
    try {
      // Step 1: Install frontend dependencies
      await execWithSpinner(
        "Installing frontend dependencies...",
        `cd ${path.join(projectPath, "frontend")} && ${
          options.packageManager
        } install`
      );

      if (options.database === "postgresql") {
        // Step 2: Start Docker services
        await execWithSpinner(
          "Starting Docker services...",
          `cd ${path.join(projectPath, "dev")} && docker compose up -d`
        );
      }

      if (options.database !== "inmemory") {
        // Step 3: Restore .NET packages
        await execWithSpinner(
          "Restoring .NET packages...",
          `cd ${path.join(projectPath, "backend")} && dotnet restore`
        );

        // Step 4: Install Entity Framework tools
        await execWithSpinner(
          "Installing Entity Framework tools...",
          "dotnet tool install --global dotnet-ef"
        );

        // Step 5: Create initial migration
        await execWithSpinner(
          "Creating initial database migration...",
          `cd ${path.join(
            projectPath,
            "backend"
          )} && dotnet ef migrations add InitialCreate`
        );

        // Step 6: Update database
        await execWithSpinner(
          "Updating database...",
          `cd ${path.join(projectPath, "backend")} && dotnet ef database update`
        );
      } else {
        // For inmemory database, just restore .NET packages
        await execWithSpinner(
          "Restoring .NET packages...",
          `cd ${path.join(projectPath, "backend")} && dotnet restore`
        );
      }

      // Step 7: Open solution
      const solutionPath = path.join(projectPath, options.projectName + ".sln");
      await execWithSpinner("Opening solution...", solutionPath);

      console.log(chalk.green.bold("\n🎉 Setup completed successfully!\n"));
    } catch (error) {
      console.error(chalk.red("\n❌ Error running setup commands:"));
      console.error(
        chalk.red(error instanceof Error ? error.message : String(error))
      );
      console.log(chalk.yellow("\nYou can run the commands manually:"));
      console.log(chalk.cyan(`  ${commandString}\n`));
    }
  } else {
    console.log(chalk.cyan("Next steps:"));
    console.log(chalk.gray("Copy and run this command:"));
    console.log(chalk.cyan(`  ${commandString}\n`));

    console.log(
      chalk.cyan(
        "To have the best experience possible, open the solution in Visual Studio:"
      )
    );
    const solutionPath = path.join(projectPath, options.projectName + ".sln");
    console.log(chalk.gray(`  ${solutionPath}`));
  }
}

async function createProject(options: ProjectOptions) {
  const { projectName } = options;
  const projectPath = path.join(process.cwd(), projectName);

  // Check if directory already exists
  if (await fs.pathExists(projectPath)) {
    throw new Error(`Directory ${projectName} already exists`);
  }

  // Create project directory
  await fs.ensureDir(projectPath);

  // Create backend files
  await createBackendFiles(projectPath, options);

  // Create frontend files
  await createFrontendFiles(projectPath, options);

  // Create additional files
  await createAdditionalFiles(projectPath, options);
}

main().catch((error) => {
  if (error instanceof Error && error.name === "ExitPromptError") {
    console.log("👋 until next time!");
  } else {
    console.error(chalk.red("\n❌ Error creating project:"));
    console.error(chalk.red(error.message));
  }

  process.exit(1);
});
