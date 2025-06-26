using Microsoft.Build.Framework;
using Microsoft.Build.Utilities;
using System;
using System.IO;

namespace ZestGenerator
{
public class TypeScriptClientGenerator : ToolTask
{
    [Required]
    public string TypeScriptClientOutputDirectory { get; set; }

    [Required]
    public string OpenApiFilePath { get; set; }

    [Required]
    public string NugetPath { get; set; }

    protected override string ToolName => "TypeScriptClientGenerator";

    protected override string GenerateFullPathToTool()
    {
        return Environment.OSVersion.Platform == PlatformID.Win32NT ? "npx.cmd" : "npx";
    }

    protected override string GetWorkingDirectory()
    {
        return TypeScriptClientOutputDirectory;
    }

    protected override string GenerateCommandLineCommands()
    {
        return $"--yes @hey-api/openapi-ts@0.73.0 --file {NugetPath}\\tools\\TypeScriptClientGeneratorConfig.ts --input {OpenApiFilePath} --output {TypeScriptClientOutputDirectory}\\client";
    }

    protected override bool ValidateParameters()
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
            Log.LogError(
                "The open api file path must not be null or empty.");
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
