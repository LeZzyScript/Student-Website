using System.ComponentModel.DataAnnotations;

namespace StudentWebsite.Models
{
    public class Organizer
    {
        [Key]
        public int ORG_Id { get; set; }

        [Required]
        [MaxLength(25)]
        public string ORG_FName { get; set; }

        [MaxLength(1)]
        public string? ORG_MiddleI { get; set; }

        [Required]
        [MaxLength(25)]
        public string ORG_LName { get; set; }

        [Required]
        [MaxLength(50)]
        public string ORG_Organization { get; set; }
    }
}