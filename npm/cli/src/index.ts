#!/usr/bin/env node

import { input, select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { exec } from 'child_process';
import { promisify } from 'util';
import ora from 'ora';
import type { ProjectOptions } from './types.js';
import { createBackendFiles } from './backend-generator.js';
import { createFrontendFiles } from './frontend-generator.js';
import { createAdditionalFiles } from './file-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

// Helper function to execute commands with spinner
async function execWithSpinner(message: string, command: string, options: any = {}) {
  const spinner = ora(message).start();
  try {
    const result = await execAsync(command, {
      cwd: process.cwd(),
      shell: 'pwsh.exe',
      ...options
    });
    spinner.succeed(message.replace(/\.\.\.$/, '') + ' completed');
    return result;
  } catch (error) {
    spinner.fail(message.replace(/\.\.\.$/, '') + ' failed');
    throw error;
  }
}

async function main() {
  console.log(chalk.blue.bold('🚀 Welcome to create-zest!'));
  console.log(chalk.gray('Create a new Zest application with .NET backend and React frontend.\n'));

  const argv = await yargs(hideBin(process.argv))
    .help()
    .argv;

  let options: ProjectOptions;

  const projectName = await input({
    message: 'What is your project name?',
    default: 'MyZestApp',
    validate: (input: string) => {
      if (!input || input.trim().length === 0) {
        return 'Project name is required';
      }
      if (!/^[A-Z][a-zA-Z]*$/.test(input)) {
        return 'Project name can only contain letters and must be in CamelCase (e.g., MyZestApp)';
      }
      return true;
    },
  });

  const useAuth = await confirm({
    message: 'Do you want to include authentication?',
    default: true,
  });

  const docker = await confirm({
    message: 'Do you want to include Docker files to deploy?',
    default: true,
  });
      
  const database = await select({
    message: 'Select database:',
    choices: [
      { name: 'postgresql', value: 'postgresql' as const },
      { name: 'in-memory', value: 'inmemory' as const },
      { name: 'sqlite', value: 'sqlite' as const },
    ],
    default: 'postgresql',
  });

  const packageManager = await select({
    message: 'Select package manager:',
    choices: [
      { name: 'npm', value: 'npm' as const },
      { name: 'yarn', value: 'yarn' as const },
      { name: 'pnpm', value: 'pnpm' as const },
    ],
    default: 'npm',
  });

  const runSetup = await confirm({
    message: 'Do you want to automatically run the setup commands after project creation?',
    default: true,
  });

  options = {
    projectName: projectName.trim(),
    useAuth,
    docker,
    database,
    packageManager,
    runSetup,
  };
  console.log("")

  // Create project with spinner
  const projectSpinner = ora('Creating your Zest application...').start();
  try {
    await createProject(options);
    projectSpinner.succeed('Project created successfully!');
  } catch (error) {
    projectSpinner.fail('Failed to create project');
    throw error;
  }

  // Build the command string
  const currentDir = process.cwd();
  const projectPath = path.join(currentDir, options.projectName);
  let setupCommands = [`cd ${projectPath}`];
  setupCommands.push(`cd frontend`, `${options.packageManager} install`, `cd ..`);

  if (options.database !== 'inmemory') {
    setupCommands.push(
      'cd dev',
      'docker compose up -d',
      'cd ..',
      'cd backend',
      'dotnet restore',
      'dotnet tool install --global dotnet-ef',
      'dotnet ef migrations add InitialCreate',
      'dotnet ef database update',
      'cd ..'
    );
  } else {
    setupCommands.push('cd backend', 'dotnet restore', 'cd ..');
  }
    
  const commandString = setupCommands.join(' && ');

  if (options.runSetup) {    
    try {
      // Step 1: Install frontend dependencies
      await execWithSpinner(
        'Installing frontend dependencies...',
        `cd ${path.join(projectPath, 'frontend')} && ${options.packageManager} install`
      );

      if (options.database !== 'inmemory') {
        // Step 2: Start Docker services
        await execWithSpinner(
          'Starting Docker services...',
          `cd ${path.join(projectPath, 'dev')} && docker compose up -d`
        );

        // Step 3: Restore .NET packages
        await execWithSpinner(
          'Restoring .NET packages...',
          `cd ${path.join(projectPath, 'backend')} && dotnet restore`
        );

        // Step 4: Install Entity Framework tools
        await execWithSpinner(
          'Installing Entity Framework tools...',
          'dotnet tool install --global dotnet-ef'
        );

        // Step 5: Create initial migration
        await execWithSpinner(
          'Creating initial database migration...',
          `cd ${path.join(projectPath, 'backend')} && dotnet ef migrations add InitialCreate`
        );

        // Step 6: Update database
        await execWithSpinner(
          'Updating database...',
          `cd ${path.join(projectPath, 'backend')} && dotnet ef database update`
        );
      } else {
        // For in-memory database, just restore .NET packages
        await execWithSpinner(
          'Restoring .NET packages...',
          `cd ${path.join(projectPath, 'backend')} && dotnet restore`
        );
      }
      
      console.log(chalk.green.bold('\n🎉 Setup completed successfully!\n'));
    } catch (error) {
      console.error(chalk.red('\n❌ Error running setup commands:'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      console.log(chalk.yellow('\nYou can run the commands manually:'));
      console.log(chalk.cyan(`  ${commandString}\n`));
    }
  } else {
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.gray('Copy and run this command:'));
    console.log(chalk.cyan(`  ${commandString}\n`));
  }

  console.log(chalk.cyan('To have the best experience possible, open the solution in Visual Studio:'));
  console.log(chalk.gray(`  ${options.projectName}.sln\n`));
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
  console.error(chalk.red('\n❌ Error creating project:'));
  console.error(chalk.red(error.message));
  process.exit(1);
});
