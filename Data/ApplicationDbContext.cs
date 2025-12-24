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

        // Configure Student-Account relationship
            modelBuilder.Entity<Student>()
                .HasOne(s => s.Account)
                .WithOne()
                .HasForeignKey<Student>(s => s.ACC_Index)
                .OnDelete(DeleteBehavior.Cascade);
            // Configure Activity-Organizer relationship
            modelBuilder.Entity<Activity>()
                .HasOne(a => a.Organizer)
                .WithMany(o => o.Activities)
                .HasForeignKey(a => a.ORG_Id)
                .OnDelete(DeleteBehavior.Cascade);
            // Configure Locker-Student relationship (one-to-one)
            modelBuilder.Entity<Locker>()
                .HasMany(l => l.LockerStatuses)
                .WithOne(ls => ls.Locker)
                .HasForeignKey(ls => ls.LOCK_Id)
                .OnDelete(DeleteBehavior.Cascade);
            // Configure ParkingStatus-Parking relationship
            modelBuilder.Entity<ParkingStatus>()
                .HasOne(p => p.Parking)
                .WithMany()
                .HasForeignKey(p => p.PARK_Id)
                .OnDelete(DeleteBehavior.NoAction);
            // Configure ParkingStatus-Account relationship
            modelBuilder.Entity<ParkingStatus>()
                .HasOne(p => p.Account)
                .WithMany()
                .HasForeignKey(p => p.ACC_Index)   
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
