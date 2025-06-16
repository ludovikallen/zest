using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Zest;

var builder = WebApplication.CreateBuilder();

// Configure configuration for CORS
builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
{
    { "Cors:AllowedOrigins:0", "http://localhost:3000" }
});

// Add Zest services
builder.Services.AddZest();

// Add Zest authentication with SQLite
builder.Services.AddZestAuth(options => options.UseInMemoryDatabase("ZestTests"));

// Add endpoints API explorer
builder.Services.AddEndpointsApiExplorer();builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()!)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Build the application
var app = builder.Build();

// Use CORS middleware before Zest
app.UseCors();

// Configure Zest middleware
app.UseZest();

// Configure Zest authentication
app.UseZestAuth();

// Add a sample endpoint for testing
app.MapGet("/api/test", () => "Hello from Zest Test!")
    .WithName("GetTestMessage");

// Add a protected endpoint for testing authentication
app.MapGet("/api/protected", () => "Protected data")
    .WithName("GetProtectedData")
    .RequireAuthorization();

app.Run();

public partial class Program
{
}