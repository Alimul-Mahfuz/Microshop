var builder = DistributedApplication.CreateBuilder(args);

// Redis Container Resource (Shared by Catalog and Basket microservices)
var cache = builder.AddRedis("cache");

// PostgreSQL Container Resource & Databases
var postgres = builder.AddPostgres("postgres");
var catalogDb = postgres.AddDatabase("catalogdb");
var identityDb = postgres.AddDatabase("identitydb");
var orderingDb = postgres.AddDatabase("orderingdb");

// Identity API Microservice
var identityApi = builder.AddProject<Projects.Microshop_IdentityApi>("identityapi")
    .WithReference(identityDb)
    .WaitFor(identityDb);

// Ordering API Microservice
var orderingApi = builder.AddProject<Projects.Microshop_OrderingApi>("orderingapi")
    .WithReference(orderingDb)
    .WaitFor(orderingDb);

// Catalog API Microservice
var catalogApi = builder.AddProject<Projects.Microshop_CatalogApi>("catalogapi")
    .WithReference(catalogDb)
    .WithReference(cache)
    .WaitFor(catalogDb)
    .WaitFor(cache);

// Basket API Microservice
var basketApi = builder.AddProject<Projects.Microshop_BasketApi>("basketapi")
    .WithReference(cache)
    .WaitFor(cache);

// Angular Web Frontend (NPM app)
builder.AddNpmApp("webfrontend", "../Microshop.Web", scriptName: "start")
    .WithReference(identityApi)
    .WithReference(catalogApi)
    .WithReference(basketApi)
    .WithReference(orderingApi)
    .WithHttpEndpoint(env: "PORT")
    .WaitFor(identityApi)
    .WaitFor(catalogApi)
    .WaitFor(basketApi)
    .WaitFor(orderingApi);

builder.Build().Run();
