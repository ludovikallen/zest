import fs from 'fs-extra';
import path from 'path';
import type { ProjectOptions } from './types.js';

export async function createBackendFiles(projectPath: string, options: ProjectOptions): Promise<void> {
  const { projectName, features, useAuth } = options;

  // Create .csproj file
  const csprojContent = `<Project ToolsVersion="17.0" Sdk="Microsoft.NET.Sdk.Web">

    <PropertyGroup>
        <TargetFramework>net9.0</TargetFramework>
        <Nullable>enable</Nullable>
        <ImplicitUsings>enable</ImplicitUsings>
        <FrontendSourcePath>$(MSBuildProjectDirectory)\\frontend\\src</FrontendSourcePath>
    </PropertyGroup>

    <ItemGroup>
      <Content Include="frontend\\.vscode\\launch.json" />
    </ItemGroup>

    <ItemGroup>
		<Content Include="frontend\\${projectName.toLowerCase()}.client.esproj" />
    </ItemGroup>

	<ItemGroup>
		<ProjectReference Include="frontend\\${projectName.toLowerCase()}.client.esproj" />
	</ItemGroup>

    <ItemGroup>
		<PackageReference Include="LudovikAllen.Zest" Version="0.0.2" />
        ${features.includes('efcore') ? '<PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="9.0.6" />' : ''}
    </ItemGroup>

</Project>`;

  await fs.writeFile(path.join(projectPath, `${projectName}.csproj`), csprojContent);

  // Create Program.cs
  const programContent = `using Microsoft.EntityFrameworkCore;
using Zest;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

${useAuth ? 'builder.Services.AddZestAuth(options => options.UseInMemoryDatabase("' + projectName + '"));' : ''}

builder.Services.AddZest();

var app = builder.Build();

app.UseZest();

${useAuth ? 'app.UseZestAuth();' : ''}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
`;

  await fs.writeFile(path.join(projectPath, 'Program.cs'), programContent);

  // Create Controllers directory and WeatherForecastController if weather feature is selected
  if (features.includes('weather')) {
    await fs.ensureDir(path.join(projectPath, 'Controllers'));
    
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

    await fs.writeFile(path.join(projectPath, 'Controllers', 'WeatherForecastController.cs'), weatherControllerContent);

    const weatherForecastContent = `namespace ${projectName};

public class WeatherForecast
{
    public DateOnly Date { get; set; }

    public int TemperatureC { get; set; }

    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);

    public string? Summary { get; set; }
}
`;

    await fs.writeFile(path.join(projectPath, 'WeatherForecast.cs'), weatherForecastContent);
  }

  // Create Properties directory and launchSettings.json
  await fs.ensureDir(path.join(projectPath, 'Properties'));
  const launchSettingsContent = `{
  "iisSettings": {
    "windowsAuthentication": false,
    "anonymousAuthentication": true,
    "iisExpress": {
      "applicationUrl": "http://localhost:5000",
      "sslPort": 7000
    }
  },
  "profiles": {
    "${projectName}": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "launchUrl": "swagger",
      "applicationUrl": "https://localhost:7000;http://localhost:5000",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    },
    "IIS Express": {
      "commandName": "IISExpress",
      "launchBrowser": true,
      "launchUrl": "swagger",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}`;

  await fs.writeFile(path.join(projectPath, 'Properties', 'launchSettings.json'), launchSettingsContent);

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

  await fs.writeFile(path.join(projectPath, 'appsettings.json'), appSettingsContent);
  await fs.writeFile(path.join(projectPath, 'appsettings.Development.json'), appSettingsContent);
}
