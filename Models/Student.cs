using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentWebsite.Models
{
    public class Student
    {
        [Key]
        public int STUD_Id { get; set; }

        [Required]
        [MaxLength(25)]
        public string STUD_FName { get; set; }

        [MaxLength(1)]
        public string? STUD_MiddleI { get; set; }

        [Required]
        [MaxLength(25)]
        public string STUD_LName { get; set; }

        // Visible Student ID shown in the UI (generated string)
        [Required]
        [MaxLength(20)]
        public string STUD_StudentId { get; set; }

        [Required]
        public int STUD_YearLevel { get; set; }

        // BSIT, BSN, etc.
        [Required]
        [MaxLength(4)]
        public string STUD_Course { get; set; }

        // Foreign key to Account (by PK)
        [Required]
        public int ACC_Index { get; set; }

        [ForeignKey(nameof(ACC_Index))]
        public Account Account { get; set; }
    }
}