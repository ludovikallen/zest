using Microsoft.EntityFrameworkCore;
using Zest;

internal class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : ZestAuthDbContext<ApplicationDbContext>(options)
{
}
