namespace Microshop.BasketApi.Entities;

public class CustomerBasket
{
    public required string BuyerId { get; set; }
    public List<BasketItem> Items { get; set; } = new();

    public CustomerBasket() { }

    [System.Diagnostics.CodeAnalysis.SetsRequiredMembers]
    public CustomerBasket(string buyerId)
    {
        BuyerId = buyerId;
    }
}
