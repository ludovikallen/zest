using Microsoft.Build.Framework;
using Microsoft.Build.Utilities;

namespace Metro;

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
        return $"--yes orval --input {BuildPath}\\generated\\swagger.json --output {BuildPath}\\frontend\\src\\generated\\generated.ts --config {BuildPath}\\bin\\debug\\net9.0\\orval.config.js";
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