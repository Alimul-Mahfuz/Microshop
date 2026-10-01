using Microshop.CatalogApi.Apis;
using Microshop.CatalogApi.Data;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add Aspire service defaults
builder.AddServiceDefaults();

// Add Postgres EF Core DbContext managed by Aspire
builder.AddNpgsqlDbContext<CatalogDbContext>("catalogdb");

// Add Redis client managed by Aspire
builder.AddRedisClient("cache");

// OpenAPI / Swagger documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var app = builder.Build();

// Auto-seed database during development/startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CatalogDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<CatalogDbContext>>();
    await CatalogDbContextSeed.SeedAsync(context, logger);
}

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// Map Catalog Endpoints
app.MapCatalogApi();

app.Run();
