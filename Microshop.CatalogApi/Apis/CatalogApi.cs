using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using Microshop.CatalogApi.Data;
using Microshop.CatalogApi.Entities;

namespace Microshop.CatalogApi.Apis;

public static class CatalogApiEndpoints
{
    public static IEndpointRouteBuilder MapCatalogApi(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api/v1/catalog");

        api.MapGet("/items", GetCatalogItems);
        api.MapGet("/items/{id:int}", GetCatalogItemById);
        api.MapGet("/items/by-name/{name}", GetCatalogItemsByName);
        api.MapGet("/brands", GetCatalogBrands);
        api.MapGet("/types", GetCatalogTypes);

        api.MapPost("/items", CreateCatalogItem);
        api.MapPut("/items/{id:int}", UpdateCatalogItem);
        api.MapDelete("/items/{id:int}", DeleteCatalogItem);

        return app;
    }

    public static async Task<IResult> GetCatalogItems(
        CatalogDbContext db,
        int pageIndex = 0,
        int pageSize = 10,
        int? brandId = null,
        int? typeId = null)
    {
        var query = db.CatalogItems.AsNoTracking();

        if (brandId.HasValue)
            query = query.Where(ci => ci.CatalogBrandId == brandId.Value);

        if (typeId.HasValue)
            query = query.Where(ci => ci.CatalogTypeId == typeId.Value);

        var totalItems = await query.CountAsync();

        var itemsOnPage = await query
            .Include(ci => ci.CatalogBrand)
            .Include(ci => ci.CatalogType)
            .OrderBy(ci => ci.Name)
            .Skip(pageSize * pageIndex)
            .Take(pageSize)
            .ToListAsync();

        return Results.Ok(new
        {
            PageIndex = pageIndex,
            PageSize = pageSize,
            Count = totalItems,
            Data = itemsOnPage
        });
    }

    public static async Task<IResult> GetCatalogItemById(
        int id,
        CatalogDbContext db,
        IConnectionMultiplexer redis)
    {
        string cacheKey = $"catalog_item_{id}";
        var redisDb = redis.GetDatabase();

        // Check Redis Cache
        var cachedJson = await redisDb.StringGetAsync(cacheKey);
        if (cachedJson.HasValue)
        {
            var cachedItem = JsonSerializer.Deserialize<CatalogItem>(cachedJson!);
            if (cachedItem != null)
                return Results.Ok(cachedItem);
        }

        // Database Lookup
        var item = await db.CatalogItems
            .Include(ci => ci.CatalogBrand)
            .Include(ci => ci.CatalogType)
            .FirstOrDefaultAsync(ci => ci.Id == id);

        if (item is null)
            return Results.NotFound(new { Message = $"Catalog item with id {id} was not found." });

        // Populate Cache (5-minute expiration)
        await redisDb.StringSetAsync(cacheKey, JsonSerializer.Serialize(item), TimeSpan.FromMinutes(5));

        return Results.Ok(item);
    }

    public static async Task<IResult> GetCatalogItemsByName(
        string name,
        CatalogDbContext db,
        int pageIndex = 0,
        int pageSize = 10)
    {
        var totalItems = await db.CatalogItems
            .Where(c => c.Name.Contains(name))
            .CountAsync();

        var itemsOnPage = await db.CatalogItems
            .Where(c => c.Name.Contains(name))
            .Include(c => c.CatalogBrand)
            .Include(c => c.CatalogType)
            .Skip(pageSize * pageIndex)
            .Take(pageSize)
            .ToListAsync();

        return Results.Ok(new { Count = totalItems, Data = itemsOnPage });
    }

    public static async Task<IResult> GetCatalogBrands(CatalogDbContext db)
    {
        var brands = await db.CatalogBrands.AsNoTracking().ToListAsync();
        return Results.Ok(brands);
    }

    public static async Task<IResult> GetCatalogTypes(CatalogDbContext db)
    {
        var types = await db.CatalogTypes.AsNoTracking().ToListAsync();
        return Results.Ok(types);
    }

    public static async Task<IResult> CreateCatalogItem(
        CatalogItem item,
        CatalogDbContext db)
    {
        db.CatalogItems.Add(item);
        await db.SaveChangesAsync();

        return Results.Created($"/api/v1/catalog/items/{item.Id}", item);
    }

    public static async Task<IResult> UpdateCatalogItem(
        int id,
        CatalogItem itemToUpdate,
        CatalogDbContext db,
        IConnectionMultiplexer redis)
    {
        var item = await db.CatalogItems.FindAsync(id);
        if (item is null)
            return Results.NotFound(new { Message = $"Catalog item with id {id} was not found." });

        item.Name = itemToUpdate.Name;
        item.Description = itemToUpdate.Description;
        item.Price = itemToUpdate.Price;
        item.CatalogBrandId = itemToUpdate.CatalogBrandId;
        item.CatalogTypeId = itemToUpdate.CatalogTypeId;
        item.AvailableStock = itemToUpdate.AvailableStock;

        await db.SaveChangesAsync();

        // Invalidate Redis cache
        var redisDb = redis.GetDatabase();
        await redisDb.KeyDeleteAsync($"catalog_item_{id}");

        return Results.NoContent();
    }

    public static async Task<IResult> DeleteCatalogItem(
        int id,
        CatalogDbContext db,
        IConnectionMultiplexer redis)
    {
        var item = await db.CatalogItems.FindAsync(id);
        if (item is null)
            return Results.NotFound();

        db.CatalogItems.Remove(item);
        await db.SaveChangesAsync();

        // Invalidate cache
        var redisDb = redis.GetDatabase();
        await redisDb.KeyDeleteAsync($"catalog_item_{id}");

        return Results.NoContent();
    }
}
