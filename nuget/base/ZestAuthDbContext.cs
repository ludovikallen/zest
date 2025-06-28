using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Zest;

public abstract class ZestAuthDbContext<TContext>(DbContextOptions<TContext> options) : IdentityDbContext<IdentityUser>(options) where TContext : DbContext
{
}