var builder = DistributedApplication.CreateBuilder(args);

// Redis Container Resource (Shared by Catalog and Basket microservices)
var cache = builder.AddRedis("cache");

// PostgreSQL Container Resource & Catalog Database
var postgres = builder.AddPostgres("postgres");
var catalogDb = postgres.AddDatabase("catalogdb");

// Catalog API Microservice
builder.AddProject<Projects.Microshop_CatalogApi>("catalogapi")
    .WithReference(catalogDb)
    .WithReference(cache)
    .WaitFor(catalogDb)
    .WaitFor(cache);

// Basket API Microservice
builder.AddProject<Projects.Microshop_BasketApi>("basketapi")
    .WithReference(cache)
    .WaitFor(cache);

builder.Build().Run();
