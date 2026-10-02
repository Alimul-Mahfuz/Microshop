using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microshop.IdentityApi.Apis;
using Microshop.IdentityApi.Data;
using Microshop.IdentityApi.Models;
using Microshop.IdentityApi.Services;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add Aspire service defaults
builder.AddServiceDefaults();

// Enable CORS for Web UI
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add Postgres EF Core DbContext for Identity managed by Aspire
builder.AddNpgsqlDbContext<ApplicationIdentityDbContext>("identitydb");

// Configure Identity Core
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationIdentityDbContext>()
.AddDefaultTokenProviders();

// Register Token Service
builder.Services.AddScoped<ITokenService, TokenService>();

// Configure JWT Authentication
var secretKey = builder.Configuration["Jwt:SecretKey"] ?? "SuperSecretKeyForMicroshopIdentityApiJwtSigningMustBe32BytesOrLonger!";
var issuer = builder.Configuration["Jwt:Issuer"] ?? "Microshop.IdentityApi";
var audience = builder.Configuration["Jwt:Audience"] ?? "Microshop.Clients";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization();

// OpenAPI / Scalar Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseCors();

// Auto-seed Identity database during development/startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationIdentityDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationIdentityDbContext>>();
    await IdentityDbContextSeed.SeedAsync(context, userManager, roleManager, logger);
}

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseAuthentication();
app.UseAuthorization();

// Map Identity Endpoints
app.MapIdentityApi();

app.Run();
