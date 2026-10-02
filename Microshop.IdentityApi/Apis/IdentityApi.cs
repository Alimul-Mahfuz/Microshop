using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microshop.IdentityApi.Models;
using Microshop.IdentityApi.Services;

namespace Microshop.IdentityApi.Apis;

public static class IdentityApi
{
    public static IEndpointRouteBuilder MapIdentityApi(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api/v1/identity").WithTags("Identity");

        api.MapPost("/register", async (RegisterRequest request, UserManager<ApplicationUser> userManager, ITokenService tokenService) =>
        {
            var existingUser = await userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return Results.BadRequest(new AuthResponse(false, string.Empty, string.Empty, DateTime.MinValue, null, new[] { "User with this email already exists." }));
            }

            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName
            };

            var result = await userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                return Results.BadRequest(new AuthResponse(false, string.Empty, string.Empty, DateTime.MinValue, null, result.Errors.Select(e => e.Description)));
            }

            await userManager.AddToRoleAsync(user, "User");
            var roles = await userManager.GetRolesAsync(user);
            var (token, expiresAt) = tokenService.GenerateToken(user, roles);

            var userDto = new UserDto(user.Id, user.Email, user.FirstName, user.LastName, roles);
            return Results.Ok(new AuthResponse(true, token, string.Empty, expiresAt, userDto));
        });

        api.MapPost("/login", async (LoginRequest request, UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, ITokenService tokenService) =>
        {
            var user = await userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return Results.BadRequest(new AuthResponse(false, string.Empty, string.Empty, DateTime.MinValue, null, new[] { "Invalid email or password." }));
            }

            var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
            if (!result.Succeeded)
            {
                return Results.BadRequest(new AuthResponse(false, string.Empty, string.Empty, DateTime.MinValue, null, new[] { "Invalid email or password." }));
            }

            var roles = await userManager.GetRolesAsync(user);
            var (token, expiresAt) = tokenService.GenerateToken(user, roles);

            var userDto = new UserDto(user.Id, user.Email ?? string.Empty, user.FirstName, user.LastName, roles);
            return Results.Ok(new AuthResponse(true, token, string.Empty, expiresAt, userDto));
        });

        api.MapGet("/me", async (ClaimsPrincipal claims, UserManager<ApplicationUser> userManager) =>
        {
            var userId = claims.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Results.Unauthorized();
            }

            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return Results.NotFound();
            }

            var roles = await userManager.GetRolesAsync(user);
            var userDto = new UserDto(user.Id, user.Email ?? string.Empty, user.FirstName, user.LastName, roles);
            return Results.Ok(userDto);
        }).RequireAuthorization();

        return app;
    }
}
