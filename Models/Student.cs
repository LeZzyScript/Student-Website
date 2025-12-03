using System.ComponentModel.DataAnnotations;

namespace StudentWebsite.Models

{
    public class Student
    {
        [Key]
        public int STUD_Id { get; set; }

        [Required,MaxLength(25)]
        public string STUD_FName { get; set; }
        
        [MaxLength(1)]
        public string? STUD_MiddleI { get; set; }

        [Required, MaxLength(25)]
        public string STUD_LName { get; set; }

        [Required]
        public int STUD_YearLevel { get; set; }

        [Required, MaxLength(4)]
        public string STUD_Course { get; set; }
    }
}
