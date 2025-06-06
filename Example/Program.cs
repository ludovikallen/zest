using Microsoft.EntityFrameworkCore;
using Zest;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddZestAuth(options => options.UseInMemoryDatabase("Example"));

builder.Services.AddZest();

var app = builder.Build();

app.UseZest();

app.UseZestAuth();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();