using Microsoft.Build.Framework;
using Microsoft.Build.Utilities;
using System;
using System.Diagnostics;
using System.IO;

namespace ZestGenerator
{
    public class TypeScriptClientGenerator : Task
    {
        [Required]
        public string TypeScriptClientOutputDirectory { get; set; }

        [Required]
        public string OpenApiFilePath { get; set; }

        [Required]
        public string NugetPath { get; set; }

        public override bool Execute()
        {
            if (!ValidateParameters())
            {
                return false;
            }

            // Create the output directory if it doesn't exist
            Directory.CreateDirectory(TypeScriptClientOutputDirectory);

            var openApiCommand = $"--file TypeScriptClientGeneratorConfig.ts --input {OpenApiFilePath} --output {TypeScriptClientOutputDirectory}\\client";

            Log.LogMessage(MessageImportance.High, $"Running: openapi-ts {openApiCommand}");

            // Try to run the openapi-ts command first
            if (RunOpenApiCommand(openApiCommand))
            {
                Log.LogMessage(MessageImportance.High, "TypeScript client generation completed successfully.");
                return true;
            }

            Log.LogMessage(MessageImportance.High, "@hey-api/openapi-ts not found or failed. Installing @hey-api/openapi-ts@0.73.0...");

            // Install the package if the first attempt failed
            var installCommand = "install -g @hey-api/openapi-ts@0.73.0";
            if (!RunNpmCommand(installCommand))
            {
                Log.LogError("Failed to install @hey-api/openapi-ts@0.73.0 package.");
                return false;
            }

            Log.LogMessage(MessageImportance.High, "Package installed successfully. Retrying TypeScript client generation...");

            // Retry the original command
            if (RunOpenApiCommand(openApiCommand))
            {
                Log.LogMessage(MessageImportance.High, "TypeScript client generation completed successfully.");
                return true;
            }
            else
            {
                Log.LogError("Failed to generate TypeScript client after installing the package.");
                return false;
            }
        }

        private bool RunOpenApiCommand(string arguments)
        {
            var openApiExecutable = Environment.OSVersion.Platform == PlatformID.Win32NT ? "openapi-ts.cmd" : "openapi-ts";
            return RunCommand(openApiExecutable, arguments);
        }

        private bool RunNpxCommand(string arguments)
        {
            var npxExecutable = Environment.OSVersion.Platform == PlatformID.Win32NT ? "npx.cmd" : "npx";
            return RunCommand(npxExecutable, arguments);
        }

        private bool RunNpmCommand(string arguments)
        {
            var npmExecutable = Environment.OSVersion.Platform == PlatformID.Win32NT ? "npm.cmd" : "npm";
            return RunCommand(npmExecutable, arguments);
        }

        private bool RunCommand(string executable, string arguments)
        {
            try
            {
                var startInfo = new ProcessStartInfo
                {
                    FileName = executable,
                    Arguments = arguments,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true,
                    WorkingDirectory = TypeScriptClientOutputDirectory
                };

                using (var process = Process.Start(startInfo))
                {
                    process.WaitForExit();

                    var output = process.StandardOutput.ReadToEnd();
                    var error = process.StandardError.ReadToEnd();

                    if (!string.IsNullOrEmpty(output))
                    {
                        Log.LogMessage(MessageImportance.Normal, output);
                    }

                    if (!string.IsNullOrEmpty(error))
                    {
                        Log.LogMessage(MessageImportance.High, error);
                    }

                    return process.ExitCode == 0;
                }
            }
            catch (Exception ex)
            {
                Log.LogError($"Error running {executable} command '{arguments}': {ex.Message}");
                return false;
            }
        }

        private bool ValidateParameters()
        {
            var valid = true;
            if (string.IsNullOrEmpty(TypeScriptClientOutputDirectory))
            {
                valid = false;
                Log.LogError("The TypeScript client output directory path must not be null or empty.");
            }

            if (string.IsNullOrEmpty(OpenApiFilePath))
            {
                valid = false;
                Log.LogError("The open api file path must not be null or empty.");
            }

            if (string.IsNullOrEmpty(NugetPath))
            {
                valid = false;
                Log.LogError("The nuget path must not be null or empty.");
            }

            return valid;
        }
    }
}
