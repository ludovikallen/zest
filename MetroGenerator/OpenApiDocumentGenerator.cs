using Microsoft.Build.Framework;
using Microsoft.Build.Utilities;

namespace MetroGenerator;

public class OpenApiDocumentGenerator : ToolTask
{
    [Required]
    public string BuildPath { get; set; }

    [Required]
    public string AssemblyPath { get; set; }

    protected override string ToolName => "OpenApiDocumentGenerator";

    protected override string GenerateFullPathToTool()
    {
        return "dotnet";
    }

    protected override string GenerateCommandLineCommands()
    {
        var nugetPackagePath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
            ".nuget", "packages", "metro", "0.0.1", "tools");

        return $"{nugetPackagePath}\\dotnet-swagger.dll tofile --output {BuildPath}\\generated\\swagger.json {AssemblyPath} v1";
    }

    protected override bool ValidateParameters()
    {
        //http address is not allowed
        var valid = true;
        if (BuildPath.StartsWith("http:") || BuildPath.StartsWith("https:"))
        {
            valid = false;
            Log.LogError("URL is not allowed as a build path");
        }

        if (AssemblyPath.StartsWith("http:") || AssemblyPath.StartsWith("https:"))
        {
            valid = false;
            Log.LogError("URL is not allowed as an assembly path");
        }

        return valid;
    }
}