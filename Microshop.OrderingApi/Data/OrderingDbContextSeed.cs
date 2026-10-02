using Microshop.OrderingApi.Entities;

namespace Microshop.OrderingApi.Data;

public static class OrderingDbContextSeed
{
    public static async Task SeedAsync(OrderingDbContext context, ILogger logger)
    {
        try
        {
            await context.Database.EnsureCreatedAsync();

            if (!context.Orders.Any())
            {
                var sampleOrder = new Order
                {
                    BuyerId = "user@microshop.com",
                    BuyerName = "John Doe",
                    ShippingAddress = "123 Main Street, Tech City, TC 10001",
                    OrderDate = DateTime.UtcNow.AddDays(-2),
                    Status = OrderStatus.Paid,
                    TotalPrice = 129.98m,
                    OrderItems = new List<OrderItem>
                    {
                        new OrderItem
                        {
                            ProductId = 1,
                            ProductName = ".NET Black Backpack",
                            UnitPrice = 89.99m,
                            Units = 1,
                            PictureUrl = "backpack.png"
                        },
                        new OrderItem
                        {
                            ProductId = 2,
                            ProductName = "Aspire Coffee Mug",
                            UnitPrice = 19.99m,
                            Units = 2,
                            PictureUrl = "mug.png"
                        }
                    }
                };

                context.Orders.Add(sampleOrder);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded sample order into database.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the ordering database.");
        }
    }
}
