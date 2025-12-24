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

        // Configure Account relationships
        modelBuilder.Entity<Account>()
            .HasMany<ActivityStatus>()
            .WithOne(a => a.Account)
            .HasForeignKey(a => a.ACC_Index)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Account>()
            .HasOne<Student>()
            .WithOne(s => s.Account)
            .HasForeignKey<Student>(s => s.ACC_Index)
            .OnDelete(DeleteBehavior.Cascade);

        // Activity relationships
        modelBuilder.Entity<Activity>()
            .HasMany<ActivityStatus>()
            .WithOne(a => a.Activity)
            .HasForeignKey(a => a.ACT_Id)
            .OnDelete(DeleteBehavior.Cascade);

        // Locker relationships
        modelBuilder.Entity<Locker>()
            .HasMany<LockerStatus>()
            .WithOne(l => l.Locker)
            .HasForeignKey(l => l.LOCK_Id)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Student relationship with Account
        modelBuilder.Entity<Student>()
            .HasOne(s => s.Account)
            .WithMany()
            .HasForeignKey(s => s.ACC_Index)
            .OnDelete(DeleteBehavior.Restrict);

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
