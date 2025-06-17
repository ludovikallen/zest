using Microsoft.Build.Framework;
using Microsoft.Build.Utilities;

namespace ZestGenerator
{
public class OpenApiDocumentGenerator : ToolTask
{
    [Required]
    public string BuildPath { get; set; }

    [Required]
    public string AssemblyPath { get; set; }

    [Required]
    public string NugetPath { get; set; }

    protected override string ToolName => "OpenApiDocumentGenerator";

    protected override string GenerateFullPathToTool()
    {
        return "dotnet";
    }

    protected override string GenerateCommandLineCommands()
    {
        return $"{NugetPath}\\tools\\dotnet-swagger.dll tofile --output {BuildPath}\\generated\\swagger.json {AssemblyPath} v1";
    }

    protected override bool ValidateParameters()
    {
        //http address is not allowed
        var valid = true;
        if (string.IsNullOrEmpty(BuildPath))
        {
            valid = false;
            Log.LogError("The build path must not be null or empty.",BuildPath);
        }

        if (string.IsNullOrEmpty(AssemblyPath))
        {
            valid = false;
            Log.LogError("The assembly path must not be null or empty.");
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