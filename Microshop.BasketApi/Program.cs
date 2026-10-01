using Microshop.BasketApi.Apis;
using Microshop.BasketApi.Repositories;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add Aspire service defaults
builder.AddServiceDefaults();

// Add Redis client managed by Aspire
builder.AddRedisClient("cache");

// Register Basket Repository in Dependency Injection
builder.Services.AddSingleton<IBasketRepository, RedisBasketRepository>();

// OpenAPI / Scalar documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var app = builder.Build();

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// Map Basket Endpoints
app.MapBasketApi();

app.Run();
