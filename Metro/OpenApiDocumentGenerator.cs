using Microsoft.Build.Framework;
using Microsoft.Build.Utilities;

namespace Metro;

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
        return $"{BuildPath}\\bin\\debug\\net9.0\\dotnet-swagger.dll tofile --output {BuildPath}\\generated\\swagger.json {BuildPath}\\bin\\debug\\net9.0\\{AssemblyName}.dll v1";
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