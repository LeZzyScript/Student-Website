using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentWebsite.Models
{
    public class Admin
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int ADMIN_Id { get; set; }

        [Required, MaxLength(25)]
        public string FName { get; set; }

        [MaxLength(1)]
        public string? MiddleI { get; set; }

        [Required, MaxLength(25)]
        public string LName { get; set; }
    }
}
