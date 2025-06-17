using Microsoft.Build.Framework;
using Microsoft.Build.Utilities;

namespace ZestGenerator;

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
        return OperatingSystem.IsWindows() ? "npx.cmd" : "npx";
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
        if (!Path.IsPathFullyQualified(TypeScriptClientOutputDirectory))
        {
            valid = false;
            Log.LogError(
                "The TypeScript client output directory path must be a fully qualified path. Please provide a fully qualified path instead of: {0}",
                TypeScriptClientOutputDirectory);
        }

        if (!Path.IsPathFullyQualified(OpenApiFilePath))
        {
            valid = false;
            Log.LogError(
                "The open api file path must be a fully qualified path. Please provide a fully qualified path instead of: {0}",
                OpenApiFilePath);
        }

        if (!Path.Exists(NugetPath))
        {
            valid = false;
            Log.LogError(
                "The nuget path must exist. Please verify the path: {0}",
                NugetPath);
        }

        return valid;
    }
}