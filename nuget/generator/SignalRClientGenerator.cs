using Microsoft.Build.Framework;
using Microsoft.Build.Utilities;
using System;
using System.Diagnostics;

namespace ZestGenerator
{
    public class SignalRClientGenerator : Task
    {
        [Required]
        public string BuildPath { get; set; }

        [Required]
        public string ProjectName { get; set; }

        [Required]
        public string NugetPath { get; set; }

        [Required]
        public string TypeScriptClientOutputDirectory { get; set; }

        public override bool Execute()
        {
            if (!ValidateParameters())
            {
                return false;
            }

            var tsrtsCommand = $"tsrts --project {BuildPath}\\{ProjectName}.csproj --output {TypeScriptClientOutputDirectory}\\signalr";

            Log.LogMessage(MessageImportance.High, $"Running: dotnet {tsrtsCommand}");

            // Try to run the tsrts command first
            if (RunDotnetCommand(tsrtsCommand))
            {
                Log.LogMessage(MessageImportance.High, "SignalR TypeScript client generation completed successfully.");

                // Copy SignalR files from NugetPath to TypeScript client output directory
                if (CopySignalRFiles())
                {
                    Log.LogMessage(MessageImportance.High, "SignalR files copied successfully.");
                    return true;
                }
                else
                {
                    Log.LogError("Failed to copy SignalR files.");
                    return false;
                }
            }

            Log.LogMessage(MessageImportance.High, "tsrts tool not found. Installing TypedSignalR.Client.TypeScript.Generator...");

            // Install the tool if the first attempt failed
            var installCommand = "tool install --global TypedSignalR.Client.TypeScript.Generator";
            if (!RunDotnetCommand(installCommand))
            {
                Log.LogError("Failed to install TypedSignalR.Client.TypeScript.Generator tool.");
                return false;
            }

            Log.LogMessage(MessageImportance.High, "Tool installed successfully. Retrying SignalR client generation...");

            // Retry the original command
            if (RunDotnetCommand(tsrtsCommand))
            {
                Log.LogMessage(MessageImportance.High, "SignalR TypeScript client generation completed successfully.");

                // Copy SignalR files from NugetPath to TypeScript client output directory
                if (CopySignalRFiles())
                {
                    Log.LogMessage(MessageImportance.High, "SignalR files copied successfully.");
                    return true;
                }
                else
                {
                    Log.LogError("Failed to copy SignalR files.");
                    return false;
                }
            }
            else
            {
                Log.LogError("Failed to generate SignalR TypeScript client after installing the tool.");
                return false;
            }
        }

        private bool RunDotnetCommand(string arguments)
        {
            try
            {
                var startInfo = new ProcessStartInfo
                {
                    FileName = "dotnet",
                    Arguments = arguments,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
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
                Log.LogError($"Error running dotnet command '{arguments}': {ex.Message}");
                return false;
            }
        }

        private bool CopySignalRFiles()
        {
            try
            {
                string copyCommand;

                if (Environment.OSVersion.Platform == PlatformID.Win32NT)
                {
                    copyCommand = $"xcopy /y /s \"{NugetPath}\\signalr\" \"{TypeScriptClientOutputDirectory}\\signalr\\\"";
                }
                else
                {
                    copyCommand = $"mkdir -p \"{TypeScriptClientOutputDirectory}/signalr/\" && cp -r \"{NugetPath}/signalr/\" \"{TypeScriptClientOutputDirectory}/\"";
                }

                var startInfo = new ProcessStartInfo
                {
                    FileName = Environment.OSVersion.Platform == PlatformID.Win32NT ? "cmd" : "sh",
                    Arguments = Environment.OSVersion.Platform == PlatformID.Win32NT ? $"/c {copyCommand}" : $"-c \"{copyCommand}\"",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
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

                    if (!string.IsNullOrEmpty(error) && process.ExitCode != 0)
                    {
                        Log.LogMessage(MessageImportance.High, error);
                    }

                    return process.ExitCode == 0;
                }
            }
            catch (Exception ex)
            {
                Log.LogError($"Error copying SignalR files: {ex.Message}");
                return false;
            }
        }

        private bool ValidateParameters()
        {
            var valid = true;
            if (string.IsNullOrEmpty(BuildPath))
            {
                valid = false;
                Log.LogError("The build path must not be null or empty.");
            }

            if (string.IsNullOrEmpty(ProjectName))
            {
                valid = false;
                Log.LogError("The project name must not be null or empty.");
            }

            if (string.IsNullOrEmpty(NugetPath))
            {
                valid = false;
                Log.LogError("The nuget path must not be null or empty.");
            }

            if (string.IsNullOrEmpty(TypeScriptClientOutputDirectory))
            {
                valid = false;
                Log.LogError("The TypeScript client output directory must not be null or empty.");
            }

            return valid;
        }
    }
}