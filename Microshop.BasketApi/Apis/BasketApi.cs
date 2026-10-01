using Microshop.BasketApi.Entities;
using Microshop.BasketApi.Repositories;

namespace Microshop.BasketApi.Apis;

public static class BasketApiEndpoints
{
    public static IEndpointRouteBuilder MapBasketApi(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api/v1/basket");

        api.MapGet("/{buyerId}", GetBasketById);
        api.MapPost("/", UpdateBasket);
        api.MapDelete("/{buyerId}", DeleteBasket);

        return app;
    }

    public static async Task<IResult> GetBasketById(string buyerId, IBasketRepository repository)
    {
        var basket = await repository.GetBasketAsync(buyerId);

        return Results.Ok(basket ?? new CustomerBasket(buyerId));
    }

    public static async Task<IResult> UpdateBasket(CustomerBasket basket, IBasketRepository repository)
    {
        if (string.IsNullOrWhiteSpace(basket.BuyerId))
        {
            return Results.BadRequest(new { Message = "BuyerId is required." });
        }

        var updatedBasket = await repository.UpdateBasketAsync(basket);

        return Results.Ok(updatedBasket);
    }

    public static async Task<IResult> DeleteBasket(string buyerId, IBasketRepository repository)
    {
        await repository.DeleteBasketAsync(buyerId);
        return Results.Ok();
    }
}
