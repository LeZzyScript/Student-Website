using System.ComponentModel.DataAnnotations;

namespace StudentWebsite.Models
{
    public class Account
    {
        [Key]
        public int ACC_Index { get; set; }

        // Frontend "userId"
        [Required]
        [MaxLength(50)]
        public string ACC_UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string ACC_Password { get; set; }

        // "student" or "admin"
        [Required]
        [MaxLength(20)]
        public string ACC_Role { get; set; }
    }
}