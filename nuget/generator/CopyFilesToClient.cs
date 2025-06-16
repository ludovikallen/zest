using Microsoft.Build.Framework;
using Microsoft.Build.Utilities;

namespace ZestGenerator;

public class CopyFilesToClient : ToolTask
{
    [Required]
    public string TypeScriptClientOutputDirectory { get; set; }

    [Required]
    public string NugetPath { get; set; }

    protected override string ToolName => "CopyFilesToClient";

    protected override string GenerateFullPathToTool()
    {
        return OperatingSystem.IsWindows() ? "xcopy" : "cp";
    }

    protected override string GenerateCommandLineCommands()
    {
        if (OperatingSystem.IsWindows())
        {
            return $"/y /i {NugetPath}\\config {TypeScriptClientOutputDirectory}\\config";
        }

        return $"-r {NugetPath}\\config\\ {TypeScriptClientOutputDirectory}";
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