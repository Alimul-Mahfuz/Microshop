using Microsoft.AspNetCore.Identity;
using Microshop.IdentityApi.Models;

namespace Microshop.IdentityApi.Data;

public static class IdentityDbContextSeed
{
    public static async Task SeedAsync(ApplicationIdentityDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, ILogger logger)
    {
        try
        {
            await context.Database.EnsureCreatedAsync();

            string[] roles = ["SuperAdmin", "Admin", "User"];
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            // 1. SuperAdmin User
            var defaultSuperAdminEmail = "superadmin@microshop.com";
            if (await userManager.FindByEmailAsync(defaultSuperAdminEmail) == null)
            {
                var superAdminUser = new ApplicationUser
                {
                    UserName = defaultSuperAdminEmail,
                    Email = defaultSuperAdminEmail,
                    FirstName = "Super",
                    LastName = "Admin",
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(superAdminUser, "SuperAdmin123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRolesAsync(superAdminUser, ["SuperAdmin", "Admin", "User"]);
                    logger.LogInformation("Seeded default SuperAdmin user: {Email}", defaultSuperAdminEmail);
                }
            }

            // 2. Admin User
            var defaultAdminEmail = "admin@microshop.com";
            if (await userManager.FindByEmailAsync(defaultAdminEmail) == null)
            {
                var adminUser = new ApplicationUser
                {
                    UserName = defaultAdminEmail,
                    Email = defaultAdminEmail,
                    FirstName = "System",
                    LastName = "Admin",
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(adminUser, "Admin123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRolesAsync(adminUser, ["Admin", "User"]);
                    logger.LogInformation("Seeded default Admin user: {Email}", defaultAdminEmail);
                }
            }

            // 3. Standard Customer User
            var defaultUserEmail = "user@microshop.com";
            if (await userManager.FindByEmailAsync(defaultUserEmail) == null)
            {
                var customerUser = new ApplicationUser
                {
                    UserName = defaultUserEmail,
                    Email = defaultUserEmail,
                    FirstName = "John",
                    LastName = "Doe",
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(customerUser, "User123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(customerUser, "User");
                    logger.LogInformation("Seeded default customer user: {Email}", defaultUserEmail);
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the identity database.");
        }
    }
}
