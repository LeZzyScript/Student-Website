using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentWebsite.Models
{
    public class Student
    {
        [Key]
        [Required]
        [MaxLength(20)]
        public required string STUD_StudentId { get; set; }

        [Required]
        [MaxLength(25)]
        public required string STUD_FName { get; set; }

        [MaxLength(1)]
        public string? STUD_MiddleI { get; set; }

        [Required]
        [MaxLength(25)]
        public required string STUD_LName { get; set; }

        [Required]
        public required int STUD_YearLevel { get; set; }

        // BSIT, BSN, etc.
        [Required]
        [MaxLength(4)]
        public required string STUD_Course { get; set; }

        // Foreign key to Account (by PK)
        [Required]
        public required int ACC_Index { get; set; }

        [ForeignKey(nameof(ACC_Index))]
        public required Account Account { get; set; }

        public virtual Parking? Parking { get; set; }
        public virtual ICollection<Locker> Lockers { get; set; }
        public virtual ICollection<Activity> Activities { get; set; }
    }
}