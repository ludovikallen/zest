import fs from "fs-extra";
import path from "path";
import type { ProjectOptions } from "./types.js";
import { randomUUID } from "crypto";

export async function createBackendFiles(
  projectPath: string,
  options: ProjectOptions
): Promise<void> {
  const { projectName, database, useAuth } = options;
  const backendPath = path.join(projectPath, "backend");

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
		<PackageReference Include="LudovikAllen.Zest" Version="0.0.8" />
      ${
        database === "inmemory"
          ? '  <PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="9.0.6" />'
          : database === "sqlite"
          ? '  <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="9.0.6" />'
          : '  <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="9.0.4" />'
      }
      ${
        database !== "inmemory" &&
        '  <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.0.6" />'
      }
    </ItemGroup>

</Project>`;

  await fs.writeFile(
    path.join(backendPath, `${projectName}.csproj`),
    csprojContent
  );

  // Create Program.cs
  const programContent = `using ${projectName};
using ${projectName}.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using Zest;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<ITodoRepository, TodoRepository>();

${getAddZestLine(useAuth, database, projectName)}

var app = builder.Build();

${getUseZestLine(useAuth)}

app.Run();
`;

  await fs.writeFile(path.join(backendPath, "Program.cs"), programContent);

  await createControllers(backendPath, projectName, useAuth);

  await createEntities(backendPath, projectName, useAuth);

  await createRepositories(backendPath, projectName, useAuth);

  await createApplicationDbContext(backendPath, projectName, useAuth);

  // Create Properties directory and launchSettings.json
  await fs.ensureDir(path.join(backendPath, "Properties"));
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

  await fs.writeFile(
    path.join(backendPath, "Properties", "launchSettings.json"),
    launchSettingsContent
  );

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

  await fs.writeFile(
    path.join(backendPath, "appsettings.json"),
    appSettingsContent
  );
  await fs.writeFile(
    path.join(backendPath, "appsettings.Development.json"),
    devAppSettingsContent
  );

  // Create solution file
  await createSolutionFile(projectPath, projectName);

  // Create solution launch file
  await createSolutionLaunchFile(projectPath, projectName);
}

async function createSolutionFile(
  projectPath: string,
  projectName: string
): Promise<void> {
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

  await fs.writeFile(
    path.join(projectPath, `${projectName}.sln`),
    solutionContent
  );
}

async function createApplicationDbContext(
  projectPath: string,
  projectName: string,
  useAuth: boolean
): Promise<void> {
  let applicationDbContexContent;
  if (!useAuth) {
    applicationDbContexContent = `using ${projectName}.Entities;
using Microsoft.EntityFrameworkCore;

namespace ${projectName};
public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Todo> Todos { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        foreach (var entity in builder.Model.GetEntityTypes().Where(e => typeof(BaseEntity).IsAssignableFrom(e.ClrType)))
        {
            builder.Entity(entity.Name).HasKey(nameof(BaseEntity.Id));
        }

        base.OnModelCreating(builder);
    }
}
`;
  } else {
    applicationDbContexContent = `using ${projectName}.Entities;
using Microsoft.EntityFrameworkCore;
using Zest;

namespace ${projectName};
public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : ZestAuthDbContext<ApplicationDbContext>(options)
{
    public DbSet<Todo> Todos { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        foreach (var entity in builder.Model.GetEntityTypes().Where(e => typeof(BaseEntity).IsAssignableFrom(e.ClrType)))
        {
            builder.Entity(entity.Name).HasKey(nameof(BaseEntity.Id));
        }

        base.OnModelCreating(builder);
    }
}
`;
  }

  await fs.writeFile(
    path.join(projectPath, "ApplicationDbContext.cs"),
    applicationDbContexContent
  );
}

function getAddZestLine(
  useAuth: boolean,
  database: string,
  projectName: string
): string {
  let databaseOptions;
  if (database === "inmemory") {
    databaseOptions =
      "options => options.UseInMemoryDatabase(Assembly.GetExecutingAssembly().GetName().Name!)";
  } else if (database === "sqlite") {
    databaseOptions =
      'options => options.UseSqlite("Data Source=' +
      projectName +
      '.db", b => b.MigrationsAssembly(Assembly.GetExecutingAssembly().GetName().Name!))';
  } else if (database === "postgresql") {
    databaseOptions =
      'options => options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"), b => b.MigrationsAssembly(Assembly.GetExecutingAssembly().GetName().Name!))';
  }

  if (useAuth) {
    return (
      "builder.Services.AddZestWithAuth<ApplicationDbContext>(" +
      databaseOptions +
      ");"
    );
  } else {
    return (
      "builder.Services.AddZest<ApplicationDbContext>(" + databaseOptions + ");"
    );
  }
}

function getUseZestLine(useAuth: boolean): string {
  if (useAuth) {
    return "app.UseZestWithAuth();";
  } else {
    return "app.UseZest();";
  }
}

async function createSolutionLaunchFile(
  projectPath: string,
  projectName: string
): Promise<void> {
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

  await fs.writeFile(
    path.join(projectPath, `${projectName}.slnLaunch`),
    slnLaunchContent
  );
}

async function createControllers(
  backendPath: string,
  projectName: string,
  useAuth: boolean
): Promise<void> {
  const controllersPath = path.join(backendPath, "Controllers");
  await fs.ensureDir(controllersPath);

  let content;
  if (useAuth) {
    content = `using ${projectName}.Entities;
using ${projectName}.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ${projectName}.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class TodoController(ITodoRepository todoRepository, ILogger<TodoController> logger) : ControllerBase
{
    [HttpGet(Name = "GetTodos")]
    public IEnumerable<Todo> Get()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId != null) 
        {
            return todoRepository.GetTodos(userId);
        }

        return [];
    }

    [HttpGet("{id:guid}", Name = "GetTodoById")]
    public ActionResult<Todo> Get(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        var todo = todoRepository.GetTodoById(id);
        if (todo == null)
        {
            return NotFound();
        }

        // Ensure the todo belongs to the current user
        if (todo.UserId != userId)
        {
            return Forbid();
        }

        return Ok(todo);
    }

    [HttpPost(Name = "CreateTodo")]
    public ActionResult<Todo> Post([FromBody] CreateTodoRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var todo = new Todo
        {
            Title = request.Title,
            Description = request.Description,
            Status = Status.Todo,
            UserId = userId
        };

        try
        {
            todoRepository.InsertTodo(todo);
            todoRepository.Save();
            return CreatedAtRoute("GetTodoById", new { id = todo.Id }, todo);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating todo for user {UserId}", userId);
            return StatusCode(500, "An error occurred while creating the todo.");
        }
    }

    [HttpPut("{id:guid}", Name = "UpdateTodo")]
    public IActionResult Put(Guid id, [FromBody] UpdateTodoRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var existingTodo = todoRepository.GetTodoById(id);
        if (existingTodo == null)
        {
            return NotFound();
        }

        // Ensure the todo belongs to the current user
        if (existingTodo.UserId != userId)
        {
            return Forbid();
        }

        try
        {
            todoRepository.UpdateTodo(existingTodo);

            existingTodo.Title = request.Title;
            existingTodo.Description = request.Description;
            existingTodo.Status = request.Status;
            existingTodo.UpdatedDate = DateTime.UtcNow;

            todoRepository.Save();
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating todo {TodoId} for user {UserId}", id, userId);
            return StatusCode(500, "An error occurred while updating the todo.");
        }
    }

    [HttpDelete("{id:guid}", Name = "DeleteTodo")]
    public IActionResult Delete(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        var todo = todoRepository.GetTodoById(id);
        if (todo == null)
        {
            return NotFound();
        }

        // Ensure the todo belongs to the current user
        if (todo.UserId != userId)
        {
            return Forbid();
        }

        try
        {
            todoRepository.DeleteTodo(id);
            todoRepository.Save();
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting todo {TodoId} for user {UserId}", id, userId);
            return StatusCode(500, "An error occurred while deleting the todo.");
        }
    }
}

public record CreateTodoRequest
{
    public required string Title { get; init; }
    public required string Description { get; init; }
}

public record UpdateTodoRequest
{
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required Status Status { get; init; }
}`;
  } else {
    content = `using ${projectName}.Entities;
using ${projectName}.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace ${projectName}.Controllers;

[ApiController]
[Route("[controller]")]
public class TodoController(ITodoRepository todoRepository, ILogger<TodoController> logger) : ControllerBase
{
    [HttpGet(Name = "GetTodos")]
    public IEnumerable<Todo> Get()
    {
        return todoRepository.GetTodos();
    }

    [HttpGet("{id:guid}", Name = "GetTodoById")]
    public ActionResult<Todo> Get(Guid id)
    {
        var todo = todoRepository.GetTodoById(id);
        if (todo == null)
        {
            return NotFound();
        }

        return Ok(todo);
    }

    [HttpPost(Name = "CreateTodo")]
    public ActionResult<Todo> Post([FromBody] CreateTodoRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var todo = new Todo
        {
            Title = request.Title,
            Description = request.Description,
            Status = Status.Todo
        };

        try
        {
            todoRepository.InsertTodo(todo);
            todoRepository.Save();
            return CreatedAtRoute("GetTodoById", new { id = todo.Id }, todo);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating todo");
            return StatusCode(500, "An error occurred while creating the todo.");
        }
    }

    [HttpPut("{id:guid}", Name = "UpdateTodo")]
    public IActionResult Put(Guid id, [FromBody] UpdateTodoRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var existingTodo = todoRepository.GetTodoById(id);
        if (existingTodo == null)
        {
            return NotFound();
        }

        try
        {
            todoRepository.UpdateTodo(existingTodo);

            existingTodo.Title = request.Title;
            existingTodo.Description = request.Description;
            existingTodo.Status = request.Status;
            existingTodo.UpdatedDate = DateTime.UtcNow;

            todoRepository.Save();
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating todo {TodoId}", id);
            return StatusCode(500, "An error occurred while updating the todo.");
        }
    }

    [HttpDelete("{id:guid}", Name = "DeleteTodo")]
    public IActionResult Delete(Guid id)
    {
        var todo = todoRepository.GetTodoById(id);
        if (todo == null)
        {
            return NotFound();
        }

        try
        {
            todoRepository.DeleteTodo(id);
            todoRepository.Save();
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting todo {TodoId}", id);
            return StatusCode(500, "An error occurred while deleting the todo.");
        }
    }
}

public record CreateTodoRequest
{
    public required string Title { get; init; }
    public required string Description { get; init; }
}

public record UpdateTodoRequest
{
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required Status Status { get; init; }
}`;
  }

  await fs.writeFile(path.join(controllersPath, "TodoController.cs"), content);
}

async function createEntities(
  backendPath: string,
  projectName: string,
  useAuth: boolean
): Promise<void> {
  const entitiesPath = path.join(backendPath, "Entities");
  await fs.ensureDir(entitiesPath);

  await createBaseEntity(entitiesPath, projectName);
  await createStatus(entitiesPath, projectName);
  await createTodo(entitiesPath, projectName, useAuth);
}

async function createBaseEntity(
  entitiesPath: string,
  projectName: string
): Promise<void> {
  const content = `namespace ${projectName}.Entities;

public record BaseEntity
{
    public Guid Id { get; } = Guid.NewGuid();

    public DateTime CreatedDate { get; } = DateTime.UtcNow;

    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
}
`;
  await fs.writeFile(path.join(entitiesPath, "BaseEntity.cs"), content);
}

async function createStatus(
  entitiesPath: string,
  projectName: string
): Promise<void> {
  const content = `namespace ${projectName}.Entities;

public enum Status
{
    Todo = 0,
    Done = 1
}
`;
  await fs.writeFile(path.join(entitiesPath, "Status.cs"), content);
}

async function createTodo(
  entitiesPath: string,
  projectName: string,
  useAuth: boolean
): Promise<void> {
  let content;
  if (useAuth) {
    content = `namespace ${projectName}.Entities;

public record Todo : BaseEntity
{
    public required string Title { get; set; }

    public required string Description { get; set; }

    public required Status Status { get; set; }

    public required string UserId { get; init; }
}
`;
  } else {
    content = `namespace ${projectName}.Entities;

public record Todo : BaseEntity
{
    public required string Title { get; set; }

    public required string Description { get; set; }

    public required Status Status { get; set; }
}
`;
  }

  await fs.writeFile(path.join(entitiesPath, "Todo.cs"), content);
}

async function createRepositories(
  backendPath: string,
  projectName: string,
  useAuth: boolean
): Promise<void> {
  const repositoriesPath = path.join(backendPath, "Repositories");
  await fs.ensureDir(repositoriesPath);

  await createTodoRepository(repositoriesPath, projectName, useAuth);
  await createITodoRepository(repositoriesPath, projectName, useAuth);
}

async function createTodoRepository(
  repositoriesPath: string,
  projectName: string,
  useAuth: boolean
): Promise<void> {
  let content;
  if (useAuth) {
    content = `using ${projectName}.Entities;
using Microsoft.EntityFrameworkCore;

namespace ${projectName}.Repositories;
public class TodoRepository(ApplicationDbContext context) : ITodoRepository, IDisposable
{
    public void DeleteTodo(Guid id)
    {
        var todo = context.Todos.Find(id);
        if (todo != null)
        {
            context.Todos.Remove(todo);
        }
    }

    public Todo? GetTodoById(Guid id)
    {
        return context.Todos.Find(id);
    }

    public IEnumerable<Todo> GetTodos(string userId)
    {
        return context.Todos.Where(todo => todo.UserId == userId);
    }

    public void InsertTodo(Todo todo)
    {
        context.Todos.Add(todo);
    }

    public void UpdateTodo(Todo todo)
    {
        context.Entry(todo).State = EntityState.Modified;
    }

    public void Save()
    {
        context.SaveChanges();
    }

    private bool disposed = false;

    protected virtual void Dispose(bool disposing)
    {
        if (!this.disposed)
        {
            if (disposing)
            {
                context.Dispose();
            }
        }
        this.disposed = true;
    }

    public void Dispose()
    {
        this.Dispose(true);
        GC.SuppressFinalize(this);
    }
}`;
  } else {
    content = `using ${projectName}.Entities;
using Microsoft.EntityFrameworkCore;

namespace ${projectName}.Repositories;
public class TodoRepository(ApplicationDbContext context) : ITodoRepository, IDisposable
{
    public void DeleteTodo(Guid id)
    {
        var todo = context.Todos.Find(id);
        if (todo != null)
        {
            context.Todos.Remove(todo);
        }
    }

    public Todo? GetTodoById(Guid id)
    {
        return context.Todos.Find(id);
    }

    public IEnumerable<Todo> GetTodos()
    {
        return context.Todos;
    }

    public void InsertTodo(Todo todo)
    {
        context.Todos.Add(todo);
    }

    public void UpdateTodo(Todo todo)
    {
        context.Entry(todo).State = EntityState.Modified;
    }

    public void Save()
    {
        context.SaveChanges();
    }

    private bool disposed = false;

    protected virtual void Dispose(bool disposing)
    {
        if (!this.disposed)
        {
            if (disposing)
            {
                context.Dispose();
            }
        }
        this.disposed = true;
    }

    public void Dispose()
    {
        this.Dispose(true);
        GC.SuppressFinalize(this);
    }
}`;
  }

  await fs.writeFile(path.join(repositoriesPath, "TodoRepository.cs"), content);
}

async function createITodoRepository(
  repositoriesPath: string,
  projectName: string,
  useAuth: boolean
): Promise<void> {
  let content;
  if (useAuth) {
    content = `using ${projectName}.Entities;

namespace ${projectName}.Repositories;

public interface ITodoRepository : IDisposable
{
    IEnumerable<Todo> GetTodos(string userId);

    Todo? GetTodoById(Guid id);

    void InsertTodo(Todo todo);

    void DeleteTodo(Guid id);

    void UpdateTodo(Todo todo);

    void Save();
}
`;
  } else {
    content = `using ${projectName}.Entities;

namespace ${projectName}.Repositories;

public interface ITodoRepository : IDisposable
{
    IEnumerable<Todo> GetTodos();

    Todo? GetTodoById(Guid id);

    void InsertTodo(Todo todo);

    void DeleteTodo(Guid id);

    void UpdateTodo(Todo todo);

    void Save();
}`;
  }

  await fs.writeFile(
    path.join(repositoriesPath, "ITodoRepository.cs"),
    content
  );
}
