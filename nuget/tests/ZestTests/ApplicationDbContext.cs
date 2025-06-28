using Microsoft.EntityFrameworkCore;
using Zest;

namespace ZestTests
{
    internal class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : ZestAuthDbContext<ApplicationDbContext>(options)
    {
    }
}
