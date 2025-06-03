using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace Metro;

public static class TypeScriptClientGeneratorService
{
    public static IServiceCollection AddTypeScriptClientGenerator(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        return services;
    }

    public static WebApplication UseTypeScriptClientGenerator(this WebApplication app)
    {
        app.UseSwagger();
        return app;
    }
}