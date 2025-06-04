using Microsoft.Build.Framework;
using Microsoft.Build.Utilities;

namespace MetroGenerator;

public class CopyFilesToClient : ToolTask
{
    [Required]
    public string BuildPath { get; set; }

    protected override string ToolName => "CopyFilesToClient";

    protected override string GenerateFullPathToTool()
    {
        return OperatingSystem.IsWindows() ? "xcopy" : "cp";
    }

    protected override string GenerateCommandLineCommands()
    {
        var nugetPackagePath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
            ".nuget", "packages", "metro", "0.0.1", "copied");

        if (OperatingSystem.IsWindows())
        {
            return $"/y /i {nugetPackagePath} {BuildPath}\\frontend\\src\\generated\\config";
        }

        return $"{nugetPackagePath} {BuildPath}\\frontend\\src\\generated\\config";
    }

    protected override bool ValidateParameters()
    {
        var valid = true;
        if (BuildPath.StartsWith("http:") || BuildPath.StartsWith("https:"))
        {
            valid = false;
            Log.LogError("URL is not allowed");
        }

        return valid;
    }
}