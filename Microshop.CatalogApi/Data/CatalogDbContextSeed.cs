using Microsoft.EntityFrameworkCore;
using Microshop.CatalogApi.Entities;

namespace Microshop.CatalogApi.Data;

public static class CatalogDbContextSeed
{
    public static async Task SeedAsync(CatalogDbContext context, ILogger logger)
    {
        try
        {
            await context.Database.EnsureCreatedAsync();

            if (!await context.CatalogBrands.AnyAsync())
            {
                await context.CatalogBrands.AddRangeAsync(GetPreconfiguredBrands());
                await context.SaveChangesAsync();
            }

            if (!await context.CatalogTypes.AnyAsync())
            {
                await context.CatalogTypes.AddRangeAsync(GetPreconfiguredTypes());
                await context.SaveChangesAsync();
            }

            if (!await context.CatalogItems.AnyAsync())
            {
                await context.CatalogItems.AddRangeAsync(GetPreconfiguredItems());
                await context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the catalog database.");
        }
    }

    private static IEnumerable<CatalogBrand> GetPreconfiguredBrands() => new List<CatalogBrand>
    {
        new() { Id = 1, Brand = ".NET Core" },
        new() { Id = 2, Brand = "Azure" },
        new() { Id = 3, Brand = "Visual Studio" },
        new() { Id = 4, Brand = "Docker" },
        new() { Id = 5, Brand = "Redis" }
    };

    private static IEnumerable<CatalogType> GetPreconfiguredTypes() => new List<CatalogType>
    {
        new() { Id = 1, Type = "Apparel" },
        new() { Id = 2, Type = "Drinkware" },
        new() { Id = 3, Type = "Accessories" },
        new() { Id = 4, Type = "Hardware" },
        new() { Id = 5, Type = "Office Supplies" }
    };

    private static IEnumerable<CatalogItem> GetPreconfiguredItems() => new List<CatalogItem>
    {
        new()
        {
            Id = 1,
            Name = ".NET Bot Premium Fleece Hoodie",
            Description = "Ultra-soft cotton blend fleece hoodie featuring the iconic .NET Bot embroidered logo on the chest.",
            Price = 59.99m,
            PictureFileName = "dotnet_hoodie.png",
            CatalogTypeId = 1,
            CatalogBrandId = 1,
            AvailableStock = 85,
            RestockThreshold = 15,
            MaxStockThreshold = 200,
            OnReorder = false
        },
        new()
        {
            Id = 2,
            Name = "Azure Cloud Developer Ceramic Mug",
            Description = "15 oz matte navy ceramic mug with Azure blue interior and heat-sensitive cloud architecture design.",
            Price = 16.50m,
            PictureFileName = "azure_mug.png",
            CatalogTypeId = 2,
            CatalogBrandId = 2,
            AvailableStock = 140,
            RestockThreshold = 20,
            MaxStockThreshold = 300,
            OnReorder = false
        },
        new()
        {
            Id = 3,
            Name = "Visual Studio Pro Mechanical Keyboard",
            Description = "Compact 75% hot-swappable mechanical keyboard pre-programmed with Visual Studio debugging shortcuts and RGB backlighting.",
            Price = 129.99m,
            PictureFileName = "vs_keyboard.png",
            CatalogTypeId = 4,
            CatalogBrandId = 3,
            AvailableStock = 30,
            RestockThreshold = 10,
            MaxStockThreshold = 100,
            OnReorder = true
        },
        new()
        {
            Id = 4,
            Name = "Docker Container Waterproof Tech Backpack",
            Description = "Durable 25L roll-top tech backpack with padded 16-inch laptop compartment and whale mascot patch.",
            Price = 89.95m,
            PictureFileName = "docker_backpack.png",
            CatalogTypeId = 3,
            CatalogBrandId = 4,
            AvailableStock = 45,
            RestockThreshold = 10,
            MaxStockThreshold = 150,
            OnReorder = false
        },
        new()
        {
            Id = 5,
            Name = "Redis In-Memory Ultra-Fast Desk Mat",
            Description = "900x400mm anti-fray stitched edge desk pad featuring Redis memory structure visual cheat sheet.",
            Price = 24.99m,
            PictureFileName = "redis_deskmat.png",
            CatalogTypeId = 5,
            CatalogBrandId = 5,
            AvailableStock = 210,
            RestockThreshold = 30,
            MaxStockThreshold = 400,
            OnReorder = false
        }
    };
}
