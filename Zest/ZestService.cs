using System.Reflection;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace Zest;

public static class ZestService
{
    public static IServiceCollection AddZest(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.OperationFilter<AuthResponsesOperationFilter>();
            options.NonNullableReferenceTypesAsRequired();
        });

        return services;
    }

    public static IServiceCollection AddZestAuth(this IServiceCollection services, Action<DbContextOptionsBuilder> options)
    {
        services.AddAuthorization();
        services.AddIdentityApiEndpoints<IdentityUser>().AddEntityFrameworkStores<ApplicationDbContext>();
        services.AddDbContext<ApplicationDbContext>(options);

        return services;
    }

    public static WebApplication UseZest(this WebApplication app)
    {
        if (app.Environment.IsDevelopment()) {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        if (Assembly.GetEntryAssembly()?.GetName().Name != "dotnet-swagger")
        {
            var hosts = app.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();

            if (hosts == null || hosts.Length == 0)
            {
                throw new InvalidOperationException("No CORS origins found. Please add a 'Cors:AllowedOrigins' section to your configuration with a string array, and at least one origin.");
            }

            app.UseCors(
                corsBuilder =>
                {
                    corsBuilder
                        .WithOrigins(hosts!)
                        .AllowCredentials()
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                });
        }

        return app;
    }

    public static WebApplication UseZestAuth(this WebApplication app)
    {
        app.MapIdentityApi<IdentityUser>();

        app.MapPost("/logout", async (SignInManager<IdentityUser> signInManager) =>
            {
                await signInManager.SignOutAsync();
                return Results.Ok();
            })
            .RequireAuthorization();

        app.MapGet("/account/status", (SignInManager<IdentityUser> signInManager, ClaimsPrincipal user) => Results.Ok((object?)signInManager.IsSignedIn(user)));

        return app;
    }
}