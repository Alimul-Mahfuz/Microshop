using Microsoft.EntityFrameworkCore;
using Microshop.OrderingApi.Data;
using Microshop.OrderingApi.Entities;
using Microshop.OrderingApi.Models;

namespace Microshop.OrderingApi.Apis;

public static class OrderingApi
{
    public static IEndpointRouteBuilder MapOrderingApi(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api/v1/orders").WithTags("Orders");

        api.MapGet("/", async (OrderingDbContext db) =>
        {
            var orders = await db.Orders
                .Include(o => o.OrderItems)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
            return Results.Ok(orders);
        });

        api.MapGet("/{id:int}", async (int id, OrderingDbContext db) =>
        {
            var order = await db.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            return order is null
                ? Results.NotFound(new { Message = $"Order with id {id} not found." })
                : Results.Ok(order);
        });

        api.MapGet("/by-buyer/{buyerId}", async (string buyerId, OrderingDbContext db) =>
        {
            var orders = await db.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.BuyerId == buyerId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return Results.Ok(orders);
        });

        api.MapPost("/", async (CreateOrderRequest request, OrderingDbContext db) =>
        {
            var order = new Order
            {
                BuyerId = request.BuyerId,
                BuyerName = request.BuyerName,
                ShippingAddress = request.ShippingAddress,
                OrderDate = DateTime.UtcNow,
                Status = OrderStatus.Submitted,
                TotalPrice = request.Items.Sum(i => i.UnitPrice * i.Units),
                OrderItems = request.Items.Select(i => new OrderItem
                {
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    UnitPrice = i.UnitPrice,
                    Units = i.Units,
                    PictureUrl = i.PictureUrl
                }).ToList()
            };

            db.Orders.Add(order);
            await db.SaveChangesAsync();

            return Results.Created($"/api/v1/orders/{order.Id}", order);
        });

        api.MapPut("/{id:int}/cancel", async (int id, OrderingDbContext db) =>
        {
            var order = await db.Orders.FindAsync(id);
            if (order is null)
            {
                return Results.NotFound(new { Message = $"Order with id {id} not found." });
            }

            order.Status = OrderStatus.Cancelled;
            await db.SaveChangesAsync();

            return Results.Ok(order);
        });

        return app;
    }
}
