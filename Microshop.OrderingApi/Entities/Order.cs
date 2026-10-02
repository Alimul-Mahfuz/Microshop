namespace Microshop.OrderingApi.Entities;

public enum OrderStatus
{
    Submitted,
    AwaitingValidation,
    StockConfirmed,
    Paid,
    Shipped,
    Cancelled
}

public class Order
{
    public int Id { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public string BuyerId { get; set; } = string.Empty;
    public string BuyerName { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public OrderStatus Status { get; set; } = OrderStatus.Submitted;
    public decimal TotalPrice { get; set; }

    public List<OrderItem> OrderItems { get; set; } = new();
}

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Units { get; set; }
    public string PictureUrl { get; set; } = string.Empty;
}
