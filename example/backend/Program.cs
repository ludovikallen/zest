using Example;
using Example.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using Zest;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<ITodoRepository, TodoRepository>();

builder.Services.AddZestWithAuth<ApplicationDbContext>(options => options.UseInMemoryDatabase(Assembly.GetExecutingAssembly().GetName().Name!));

var app = builder.Build();

app.UseZestWithAuth();

app.Run();
