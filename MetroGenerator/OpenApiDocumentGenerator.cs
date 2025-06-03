using Microsoft.Build.Framework;
using Microsoft.Build.Utilities;

namespace MetroGenerator;

public class OpenApiDocumentGenerator : ToolTask
{
    [Required]
    public string BuildPath { get; set; }

    [Required]
    public string AssemblyName { get; set; }

    protected override string ToolName => "OpenApiDocumentGenerator";

    protected override string GenerateFullPathToTool()
    {
        return "dotnet";
    }

    protected override string GenerateCommandLineCommands()
    {
        var dotnetSwaggerPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
            ".nuget", "packages", "metro", "0.0.1", "tools", "dotnet-swagger.dll");

        return $"{dotnetSwaggerPath} tofile --output {BuildPath}\\generated\\swagger.json {BuildPath}\\bin\\debug\\net9.0\\{AssemblyName}.dll v1";
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

        if (string.IsNullOrEmpty(AssemblyName))
        {
            valid = false;
            Log.LogError("Assembly must not be null or empty");
        }

        return valid;
    }
}