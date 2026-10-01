using Microshop.BasketApi.Entities;

namespace Microshop.BasketApi.Repositories;

public interface IBasketRepository
{
    Task<CustomerBasket?> GetBasketAsync(string buyerId);
    Task<CustomerBasket?> UpdateBasketAsync(CustomerBasket basket);
    Task<bool> DeleteBasketAsync(string buyerId);
}
