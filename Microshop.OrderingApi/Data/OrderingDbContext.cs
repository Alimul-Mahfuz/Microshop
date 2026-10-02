using Microsoft.EntityFrameworkCore;
using Microshop.OrderingApi.Entities;

namespace Microshop.OrderingApi.Data;

public class OrderingDbContext : DbContext
{
    public OrderingDbContext(DbContextOptions<OrderingDbContext> options)
        : base(options)
    {
    }

    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Order>(b =>
        {
            b.HasKey(o => o.Id);
            b.Property(o => o.BuyerId).IsRequired().HasMaxLength(200);
            b.Property(o => o.BuyerName).IsRequired().HasMaxLength(200);
            b.Property(o => o.ShippingAddress).HasMaxLength(500);
            b.Property(o => o.TotalPrice).HasColumnType("decimal(18,2)");
            b.HasMany(o => o.OrderItems)
             .WithOne()
             .HasForeignKey(oi => oi.OrderId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrderItem>(b =>
        {
            b.HasKey(oi => oi.Id);
            b.Property(oi => oi.ProductName).IsRequired().HasMaxLength(200);
            b.Property(oi => oi.UnitPrice).HasColumnType("decimal(18,2)");
        });
    }
}
