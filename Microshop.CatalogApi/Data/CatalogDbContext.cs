using Microsoft.EntityFrameworkCore;
using Microshop.CatalogApi.Entities;

namespace Microshop.CatalogApi.Data;

public class CatalogDbContext : DbContext
{
    public CatalogDbContext(DbContextOptions<CatalogDbContext> options) : base(options)
    {
    }

    public DbSet<CatalogItem> CatalogItems => Set<CatalogItem>();
    public DbSet<CatalogBrand> CatalogBrands => Set<CatalogBrand>();
    public DbSet<CatalogType> CatalogTypes => Set<CatalogType>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<CatalogBrand>(b =>
        {
            b.HasKey(ci => ci.Id);
            b.Property(ci => ci.Brand).IsRequired().HasMaxLength(100);
        });

        builder.Entity<CatalogType>(b =>
        {
            b.HasKey(ci => ci.Id);
            b.Property(ci => ci.Type).IsRequired().HasMaxLength(100);
        });

        builder.Entity<CatalogItem>(b =>
        {
            b.HasKey(ci => ci.Id);
            b.Property(ci => ci.Name).IsRequired().HasMaxLength(100);
            b.Property(ci => ci.Price).HasPrecision(18, 2);
            b.HasOne(ci => ci.CatalogBrand).WithMany().HasForeignKey(ci => ci.CatalogBrandId);
            b.HasOne(ci => ci.CatalogType).WithMany().HasForeignKey(ci => ci.CatalogTypeId);
        });
    }
}
