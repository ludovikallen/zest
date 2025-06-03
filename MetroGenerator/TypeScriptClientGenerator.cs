using Microsoft.Build.Framework;
using Microsoft.Build.Utilities;

namespace MetroGenerator;

public class TypeScriptClientGenerator : ToolTask
{
    [Required]
    public string BuildPath { get; set; }

    protected override string ToolName => "TypeScriptClientGenerator";

    protected override string GenerateFullPathToTool()
    {
        return OperatingSystem.IsWindows() ? "npx.cmd" : "npx";
    }

    protected override string GenerateCommandLineCommands()
    {
        var orvalConfigPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
            ".nuget", "packages", "metro", "0.0.1", "tools", "orval.config.js");

        return $"--yes orval --input {BuildPath}\\generated\\swagger.json --output {BuildPath}\\frontend\\src\\generated\\generated.ts --config {orvalConfigPath}";
    }

    protected override bool ValidateParameters()
    {
        //http address is not allowed
        var valid = true;
        if (BuildPath.StartsWith("http:") || BuildPath.StartsWith("https:"))
        {
            valid = false;
            Log.LogError("URL is not allowed");
        }

        return valid;
    }
}