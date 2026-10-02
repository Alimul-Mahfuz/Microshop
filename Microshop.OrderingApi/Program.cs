using Microshop.OrderingApi.Apis;
using Microshop.OrderingApi.Data;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add Aspire service defaults
builder.AddServiceDefaults();

// Enable CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add Postgres EF Core DbContext for Ordering managed by Aspire
builder.AddNpgsqlDbContext<OrderingDbContext>("orderingdb");

// OpenAPI / Scalar Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseCors();

// Auto-seed Ordering database during development/startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<OrderingDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<OrderingDbContext>>();
    await OrderingDbContextSeed.SeedAsync(context, logger);
}

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// Map Ordering Endpoints
app.MapOrderingApi();

app.Run();
