namespace Microshop.OrderingApi.Models;

public record CreateOrderRequest(
    string BuyerId,
    string BuyerName,
    string ShippingAddress,
    List<CreateOrderItemDto> Items
);

public record CreateOrderItemDto(
    int ProductId,
    string ProductName,
    decimal UnitPrice,
    int Units,
    string PictureUrl
);
