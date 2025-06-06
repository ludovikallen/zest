using Microsoft.EntityFrameworkCore;
using Zest;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddSimpleEmailPasswordCookieAuth(options => options.UseInMemoryDatabase("Example"));

builder.Services.AddTypeScriptClientGenerator();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseCors(
        corsBuilder =>
        {
            corsBuilder
                .WithOrigins("http://localhost:5173")
                .AllowCredentials()
                .AllowAnyMethod()
                .AllowAnyHeader();
        });

    app.UseTypeScriptClientGenerator();
}

app.UseSimpleEmailPasswordCookieAuth();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();