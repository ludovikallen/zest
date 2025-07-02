using Microsoft.Build.Framework;
using Microsoft.Build.Utilities;
using System;

namespace ZestGenerator
{

    public class CopyFilesToClient : ToolTask
    {
        [Required]
        public string TypeScriptClientOutputDirectory { get; set; }

        [Required]
        public string NugetPath { get; set; }

        protected override string ToolName => "CopyFilesToClient";

        protected override string GenerateFullPathToTool()
        {
            return Environment.OSVersion.Platform == PlatformID.Win32NT ? "cmd \\c" : "sh -c";
        }

        protected override string GenerateCommandLineCommands()
        {
            this.UseCommandProcessor = true;

            if (Environment.OSVersion.Platform == PlatformID.Win32NT)
            {
                return $"xcopy /y /i {NugetPath}\\config {TypeScriptClientOutputDirectory}\\config && xcopy /y {NugetPath}\\tools\\TypeScriptClientGeneratorConfig.ts {TypeScriptClientOutputDirectory}\\";
            }

            return $"mkdir -p {TypeScriptClientOutputDirectory}\\config\\ && cp -a {NugetPath}\\config\\ {TypeScriptClientOutputDirectory}\\ && cp {NugetPath}\\tools\\TypeScriptClientGeneratorConfig.ts {TypeScriptClientOutputDirectory}\\";
        }

        protected override bool ValidateParameters()
        {
            var valid = true;
            if (string.IsNullOrEmpty(TypeScriptClientOutputDirectory))
            {
                valid = false;
                Log.LogError("The TypeScript client output directory path must not be null or empty.");
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