namespace Microshop.BasketApi.Entities;

public class BasketItem
{
    public required string Id { get; set; } = Guid.NewGuid().ToString();
    public int ProductId { get; set; }
    public required string ProductName { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal OldUnitPrice { get; set; }
    public int Quantity { get; set; }
    public string? PictureUrl { get; set; }
}
