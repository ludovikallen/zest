using Microsoft.Build.Framework;
using Microsoft.Build.Utilities;

namespace ZestGenerator;

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
        if (!Path.Exists(BuildPath))
        {
            valid = false;
            Log.LogError(
                "The build path must exist. Please verify the path: {0}",
                BuildPath);
        }

        if (!Path.Exists(AssemblyPath))
        {
            valid = false;
            Log.LogError(
                "The assembly path must exist. Please verify the path: {0}",
                AssemblyPath);
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