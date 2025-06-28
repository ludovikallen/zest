import fs from 'fs-extra';
import path from 'path';
import type { ProjectOptions } from './types.js';
import { randomUUID } from 'crypto';

export async function createBackendFiles(projectPath: string, options: ProjectOptions): Promise<void> {
  const { projectName, database, useAuth } = options;
  const backendPath = path.join(projectPath, 'backend');
  
  // Create backend directory
  await fs.ensureDir(backendPath);

  // Create .csproj file
  const csprojContent = `<Project ToolsVersion="17.0" Sdk="Microsoft.NET.Sdk.Web">

    <PropertyGroup>
        <TargetFramework>net9.0</TargetFramework>
        <Nullable>enable</Nullable>
        <ImplicitUsings>enable</ImplicitUsings>
        <FrontendSourcePath>$(MSBuildProjectDirectory)\\..\\frontend\\src</FrontendSourcePath>
    </PropertyGroup>

    <ItemGroup>
		  <PackageReference Include="LudovikAllen.Zest" Version="0.0.3" />
      ${database === 'inmemory' ? '  <PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="9.0.6" />' :
      database === 'sqlite' ? '  <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="9.0.6" />' :
      ' <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="9.0.4" />'}
      ${database !== 'inmemory' ? '  <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.0.6" />' : ''}
    </ItemGroup>

</Project>`;

  await fs.writeFile(path.join(backendPath, `${projectName}.csproj`), csprojContent);

  // Create Program.cs
  const programContent = `using Microsoft.EntityFrameworkCore;
using System.Reflection;
using Zest;

var builder = WebApplication.CreateBuilder(args);

${getAddZestLine(useAuth, database, projectName)}

var app = builder.Build();

${getUseZestLine(useAuth)}

app.Run();
`;

  await fs.writeFile(path.join(backendPath, 'Program.cs'), programContent);

  // Create Controllers directory and WeatherForecastController if weather feature is selected
  await fs.ensureDir(path.join(backendPath, 'Controllers'));
    
  const weatherControllerContent = `using Microsoft.AspNetCore.Mvc;

namespace ${projectName}.Controllers;

[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private static readonly string[] Summaries = new[]
    {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };

    private readonly ILogger<WeatherForecastController> _logger;

    public WeatherForecastController(ILogger<WeatherForecastController> logger)
    {
        _logger = logger;
    }

    [HttpGet(Name = "GetWeatherForecast")]
    public IEnumerable<WeatherForecast> Get()
    {
        return Enumerable.Range(1, 5).Select(index => new WeatherForecast
        {
            Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            TemperatureC = Random.Shared.Next(-20, 55),
            Summary = Summaries[Random.Shared.Next(Summaries.Length)]
        })
        .ToArray();
    }
}
`;

  await fs.writeFile(path.join(backendPath, 'Controllers', 'WeatherForecastController.cs'), weatherControllerContent);

  const weatherForecastContent = `namespace ${projectName};

public class WeatherForecast
{
    public DateOnly Date { get; set; }

    public int TemperatureC { get; set; }

    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);

    public string? Summary { get; set; }
}
`;

  await fs.writeFile(path.join(backendPath, 'WeatherForecast.cs'), weatherForecastContent);

  await createApplicationDbContext(backendPath, useAuth);

  // Create Properties directory and launchSettings.json
  await fs.ensureDir(path.join(backendPath, 'Properties'));
  const launchSettingsContent = `{
  "profiles": {
    "http": {
      "commandName": "Project",
      "launchUrl": "http://localhost:5173",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      },
      "dotnetRunMessages": true,
      "hotReloadEnabled": true,
      "applicationUrl": "http://localhost:5226"
    },
    "https": {
      "commandName": "Project",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      },
      "dotnetRunMessages": true,
      "hotReloadEnabled": false,
      "applicationUrl": "https://localhost:7097;http://localhost:5226"
    }
  },
  "$schema": "https://json.schemastore.org/launchsettings.json"
}`;

  await fs.writeFile(path.join(backendPath, 'Properties', 'launchSettings.json'), launchSettingsContent);

  // Create appsettings files
  const appSettingsContent = `{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}`;
  const devAppSettingsContent = `{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173"]
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=${projectName.toLowerCase()};Username=postgres;Password=postgres"
  }
}`;

  await fs.writeFile(path.join(backendPath, 'appsettings.json'), appSettingsContent);
  await fs.writeFile(path.join(backendPath, 'appsettings.Development.json'), devAppSettingsContent);

  // Create solution file
  await createSolutionFile(projectPath, projectName);

  // Create solution launch file
  await createSolutionLaunchFile(projectPath, projectName);
}

async function createSolutionFile(projectPath: string, projectName: string): Promise<void> {
  const backendProjectGuid = randomUUID().toUpperCase();
  const frontendProjectGuid = randomUUID().toUpperCase();
  const solutionGuid = randomUUID().toUpperCase();

  const solutionContent = `Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 17
VisualStudioVersion = 17.14.36203.30 d17.14
MinimumVisualStudioVersion = 10.0.40219.1
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "${projectName}", "backend\\${projectName}.csproj", "{${backendProjectGuid}}"
EndProject
Project("{54A90642-561A-4BB1-A94E-469ADEE60C69}") = "${projectName.toLowerCase()}.frontend", "frontend\\${projectName.toLowerCase()}.frontend.esproj", "{${frontendProjectGuid}}"
EndProject
Global
	GlobalSection(SolutionConfigurationPlatforms) = preSolution
		Debug|Any CPU = Debug|Any CPU
		Release|Any CPU = Release|Any CPU
	EndGlobalSection
	GlobalSection(ProjectConfigurationPlatforms) = postSolution
		{${backendProjectGuid}}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{${backendProjectGuid}}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{${backendProjectGuid}}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{${backendProjectGuid}}.Release|Any CPU.Build.0 = Release|Any CPU
		{${frontendProjectGuid}}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{${frontendProjectGuid}}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{${frontendProjectGuid}}.Debug|Any CPU.Deploy.0 = Debug|Any CPU
		{${frontendProjectGuid}}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{${frontendProjectGuid}}.Release|Any CPU.Build.0 = Release|Any CPU
		{${frontendProjectGuid}}.Release|Any CPU.Deploy.0 = Release|Any CPU
	EndGlobalSection
	GlobalSection(SolutionProperties) = preSolution
		HideSolutionNode = FALSE
	EndGlobalSection
	GlobalSection(ExtensibilityGlobals) = postSolution
		SolutionGuid = {${solutionGuid}}
	EndGlobalSection
EndGlobal
`;

  await fs.writeFile(path.join(projectPath, `${projectName}.sln`), solutionContent);
}

async function createApplicationDbContext(projectPath: string, useAuth: boolean): Promise<void> {
  let applicationDbContexContent;
  if (!useAuth) {
    applicationDbContexContent = `using Microsoft.EntityFrameworkCore;

internal class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
}
`
  } else {
    applicationDbContexContent = `using Microsoft.EntityFrameworkCore;
using Zest;

internal class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : ZestAuthDbContext<ApplicationDbContext>(options)
{
}
`
  }

    await fs.writeFile(path.join(projectPath, 'ApplicationDbContext.cs'), applicationDbContexContent);
}

function getAddZestLine(useAuth: boolean, database: string, projectName: string): string {
  let databaseOptions;
  if (database === 'inmemory') {
    databaseOptions = 'options => options.UseInMemoryDatabase(Assembly.GetExecutingAssembly().GetName().Name)';
  } else if (database === 'sqlite') {
    databaseOptions = 'options => options.UseSqlite("Data Source=' + projectName + '.db", b => b.MigrationsAssembly(Assembly.GetExecutingAssembly().GetName().Name))';
  } else if (database === 'postgresql') {
    databaseOptions = 'options => options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"), b => b.MigrationsAssembly(Assembly.GetExecutingAssembly().GetName().Name))';
  }

  if (useAuth) {
      return 'builder.Services.AddZestWithAuth<ApplicationDbContext>('+ databaseOptions +');';
  } else {
      return 'builder.Services.AddZest<ApplicationDbContext>('+ databaseOptions +');';
  }
}

function getUseZestLine(useAuth: boolean): string {
  if (useAuth) {
    return 'app.UseZestWithAuth();';
  } else {
    return 'app.UseZest();';
  }
}

async function createSolutionLaunchFile(projectPath: string, projectName: string): Promise<void> {
  const slnLaunchContent = `[
  {
    "Name": "dev",
    "Projects": [
      {
        "Path": "backend\\\\${projectName}.csproj",
        "Action": "Start",
        "DebugTarget": "http"
      },
      {
        "Path": "frontend\\\\${projectName.toLowerCase()}.frontend.esproj",
        "Action": "Start",
        "DebugTarget": "localhost (Chrome)"
      }
    ]
  }
]`;

  await fs.writeFile(path.join(projectPath, `${projectName}.slnLaunch`), slnLaunchContent);
}