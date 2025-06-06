using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Zest;

public static class TypeScriptClientGeneratorService
{
    public static IServiceCollection AddTypeScriptClientGenerator(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options => options.OperationFilter<AuthResponsesOperationFilter>());

        return services;
    }

    public static IServiceCollection AddSimpleEmailPasswordCookieAuth(this IServiceCollection services, Action<DbContextOptionsBuilder> options)
    {
        services.AddAuthorization();
        services.AddIdentityApiEndpoints<IdentityUser>().AddEntityFrameworkStores<ApplicationDbContext>();
        services.AddDbContext<ApplicationDbContext>(options);

        return services;
    }

    public static WebApplication UseTypeScriptClientGenerator(this WebApplication app)
    {
        app.UseSwagger();
        app.UseSwaggerUI();

        return app;
    }

    public static WebApplication UseSimpleEmailPasswordCookieAuth(this WebApplication app)
    {
        app.MapIdentityApi<IdentityUser>();

        app.MapPost("/logout", async (SignInManager<IdentityUser> signInManager) =>
            {
                await signInManager.SignOutAsync();
                return Results.Ok();
            })
            .RequireAuthorization();

        return app;
    }
}