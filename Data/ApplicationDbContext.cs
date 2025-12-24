using Microsoft.EntityFrameworkCore;
using StudentWebsite.Models;

namespace StudentWebsite.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Account> Accounts { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Locker> Lockers { get; set; }
        public DbSet<Parking> Parkings { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<Organizer> Organizers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Account relationships
            modelBuilder.Entity<Account>()
                .HasMany<Student>()
                .WithOne(s => s.Account)
                .HasForeignKey(s => s.ACC_Index)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Student-Activity relationship (One-to-Many)
            modelBuilder.Entity<Student>()
                .HasMany(s => s.Activities)
                .WithOne(a => a.Student)
                .HasForeignKey(a => a.STUD_StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Activity-Organizer relationship (One Organizer -> Many Activities)
            modelBuilder.Entity<Activity>()
                .HasOne(a => a.Organizer)
                .WithMany(o => o.Activities)
                .HasForeignKey(a => a.ORG_Id)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Student-Parking relationship (One-to-One)
            modelBuilder.Entity<Student>()
                .HasOne(s => s.Parking)
                .WithOne(p => p.Student)
                .HasForeignKey<Parking>(p => p.STUD_StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Student-Locker relationship (One-to-Many)
            modelBuilder.Entity<Student>()
                .HasMany(s => s.Lockers)
                .WithOne(l => l.Student)
                .HasForeignKey(l => l.STUD_StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}