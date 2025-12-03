using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentWebsite.Models
{
    public class Account
    {
        [Key]
        public int ACC_Index { get; set; }

        [Required]
        public int ACC_UserId { get; set; }

        [Required]
        public string ACC_Password { get; set; }

        //Check if admin
        public int? ADMIN_Id { get; set; }

        [ForeignKey("ADMIN_Id")]
        public Admin Admin { get; set; }

    }
}
