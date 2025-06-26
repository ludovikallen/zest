#!/usr/bin/env node
import { input, select, confirm, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { AVAILABLE_FEATURES } from './types.js';
import { createBackendFiles } from './backend-generator.js';
import { createFrontendFiles } from './frontend-generator.js';
import { createAdditionalFiles } from './file-generator.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function main() {
    console.log(chalk.blue.bold('\n🚀 Welcome to create-zest!\n'));
    console.log(chalk.gray('Create a new Zest application with .NET backend and React frontend.\n'));
    const argv = await yargs(hideBin(process.argv))
        .option('name', {
        alias: 'n',
        type: 'string',
        description: 'Project name',
    })
        .option('yes', {
        alias: 'y',
        type: 'boolean',
        description: 'Use default options',
        default: false,
    })
        .help()
        .argv;
    let options;
    if (argv.yes) {
        options = {
            projectName: argv.name || 'my-zest-app',
            useAuth: true,
            features: ['docker'],
            packageManager: 'npm',
        };
    }
    else {
        const projectName = argv.name || await input({
            message: 'What is your project name?',
            default: 'my-zest-app',
            validate: (input) => {
                if (!input || input.trim().length === 0) {
                    return 'Project name is required';
                }
                if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
                    return 'Project name can only contain letters, numbers, hyphens, and underscores';
                }
                return true;
            },
        });
        const useAuth = await confirm({
            message: 'Do you want to include authentication?',
            default: true,
        });
        const features = await checkbox({
            message: 'Select additional features:',
            choices: AVAILABLE_FEATURES,
            required: false,
        });
        const packageManager = await select({
            message: 'Select package manager:',
            choices: [
                { name: 'npm', value: 'npm' },
                { name: 'yarn', value: 'yarn' },
                { name: 'pnpm', value: 'pnpm' },
            ],
            default: 'npm',
        });
        options = {
            projectName: projectName.trim(),
            useAuth,
            features: ['weather', ...features], // Always include weather as default
            packageManager,
        };
    }
    console.log(chalk.green('\n✨ Creating your Zest application...\n'));
    await createProject(options);
    console.log(chalk.green.bold('\n🎉 Project created successfully!\n'));
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.gray(`  cd ${options.projectName}`));
    console.log(chalk.gray('  dotnet restore'));
    console.log(chalk.gray(`  cd frontend && ${options.packageManager} install`));
    console.log(chalk.gray('  dotnet run\n'));
}
async function createProject(options) {
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
//# sourceMappingURL=index.js.map