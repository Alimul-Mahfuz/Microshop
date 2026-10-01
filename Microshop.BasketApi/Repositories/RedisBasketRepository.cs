using System.Text.Json;
using Microshop.BasketApi.Entities;
using StackExchange.Redis;

namespace Microshop.BasketApi.Repositories;

public class RedisBasketRepository : IBasketRepository
{
    private readonly IConnectionMultiplexer _redis;
    private readonly IDatabase _database;
    private readonly ILogger<RedisBasketRepository> _logger;

    public RedisBasketRepository(IConnectionMultiplexer redis, ILogger<RedisBasketRepository> logger)
    {
        _redis = redis;
        _database = redis.GetDatabase();
        _logger = logger;
    }

    public async Task<CustomerBasket?> GetBasketAsync(string buyerId)
    {
        var data = await _database.StringGetAsync(GetBasketKey(buyerId));

        if (data.IsNullOrEmpty)
        {
            return null;
        }

        return JsonSerializer.Deserialize<CustomerBasket>(data!);
    }

    public async Task<CustomerBasket?> UpdateBasketAsync(CustomerBasket basket)
    {
        var created = await _database.StringSetAsync(
            GetBasketKey(basket.BuyerId),
            JsonSerializer.Serialize(basket),
            TimeSpan.FromDays(30)); // Basket expires in 30 days of inactivity

        if (!created)
        {
            _logger.LogWarning("Problem occurred persisting basket for buyer {BuyerId}.", basket.BuyerId);
            return null;
        }

        _logger.LogInformation("Basket updated successfully for buyer {BuyerId}.", basket.BuyerId);
        return await GetBasketAsync(basket.BuyerId);
    }

    public async Task<bool> DeleteBasketAsync(string buyerId)
    {
        return await _database.KeyDeleteAsync(GetBasketKey(buyerId));
    }

    private static string GetBasketKey(string buyerId) => $"basket:{buyerId}";
}
