using Example.Entities;
using Microsoft.EntityFrameworkCore;
using Zest;

namespace Example;
public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : ZestAuthDbContext<ApplicationDbContext>(options)
{
    public DbSet<Todo> Todos { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        foreach (var entity in builder.Model.GetEntityTypes().Where(e => typeof(BaseEntity).IsAssignableFrom(e.ClrType)))
        {
            builder.Entity(entity.Name).HasKey(nameof(BaseEntity.Id));
        }

        base.OnModelCreating(builder);
    }
}
