using Microsoft.EntityFrameworkCore;
using EtkinlikAPI.Models;
using EtkinlikAPI.Data;

namespace EtkinlikAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> opts)
            : base(opts) { }

        public DbSet<Event> Events { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Announcement> Announcements { get; set; }

    }
}
