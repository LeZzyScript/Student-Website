using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentWebsite.Models
{
    public class Activity
    {
        [Key]
        public int ACT_Id { get; set; }
        [Required]
        public int STUD_Id { get; set; }
        [ForeignKey("STUD_Id")]
        public Student Student { get; set; }

        [Required]
        public int ORG_Id { get; set; }
        [ForeignKey("ORG_Id")]
        public Organizer Organizer { get; set; }

        [Required, MaxLength(50)]
        public string ACT_Name { get; set; }
        [Required, MaxLength(200)]
        public string ACT_Description { get; set; }

        [Required]
        public bool ACT_IsGranted { get; set; }
    }
}
