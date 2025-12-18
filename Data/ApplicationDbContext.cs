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
        public DbSet<Locker> Lockers { get; set; }
        public DbSet<LockerStatus> LockerStatuses { get; set; }
        public DbSet<Parking> Parkings { get; set; }
        public DbSet<ParkingStatus> ParkingStatuses { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<ActivityStatus> ActivityStatuses { get; set; }
        public DbSet<Organizer> Organizers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // ActivityStatus
    modelBuilder.Entity<ActivityStatus>()
        .HasOne(a => a.Activity)
        .WithMany()
        .HasForeignKey(a => a.ACT_Id)
        .OnDelete(DeleteBehavior.NoAction);

    modelBuilder.Entity<ActivityStatus>()
        .HasOne(a => a.Account)
        .WithMany()
        .HasForeignKey(a => a.ACC_Index)   
        .OnDelete(DeleteBehavior.NoAction);

    // LockerStatus
    modelBuilder.Entity<LockerStatus>()
        .HasOne(l => l.Locker)
        .WithMany()
        .HasForeignKey(l => l.LOCK_Id)
        .OnDelete(DeleteBehavior.NoAction);

    modelBuilder.Entity<LockerStatus>()
        .HasOne(l => l.Account)
        .WithMany()
        .HasForeignKey(l => l.ACC_Index)   
        .OnDelete(DeleteBehavior.NoAction);

    // ParkingStatus
    modelBuilder.Entity<ParkingStatus>()
        .HasOne(p => p.Parking)
        .WithMany()
        .HasForeignKey(p => p.PARK_Id)
        .OnDelete(DeleteBehavior.NoAction);

    modelBuilder.Entity<ParkingStatus>()
        .HasOne(p => p.Account)
        .WithMany()
        .HasForeignKey(p => p.ACC_Index)   
        .OnDelete(DeleteBehavior.NoAction);
}
    }
}
