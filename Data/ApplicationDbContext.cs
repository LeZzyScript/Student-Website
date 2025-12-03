using Microsoft.EntityFrameworkCore;
using StudentWebsite.Models;

namespace StudentWebsite.Data
{
    public class ApplicationDbContext:DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Locker> Lockers { get; set; }
        public DbSet<LockerStatus> LockerStatuses { get; set; }
        public DbSet<Parking> Parkings { get; set; }
        public DbSet<ParkingStatus> ParkingStatuses { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<ActivityStatus> ActivityStatuses { get; set; }
        public DbSet<Organizer> Organizers { get; set; }
    }
}
