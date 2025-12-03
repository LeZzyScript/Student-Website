using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentWebsite.Models
{
    public class LockerStatus
    {
        [Key]
        public int LOCK_StatusId { get; set; }

        [Required]
        public int LOCK_Id { get; set; }
        [ForeignKey("LOCK_Id")]
        public Locker Locker { get; set; }

        [Required]
        public int ADMIN_Id { get; set; }

        [ForeignKey("ADMIN_Id")]
        public Admin Admin { get; set; }

        [Required]
        public bool LOCK_IsGranted { get; set; }

        [Required, MaxLength(100)]
        public string LOCK_Notify { get; set; }
    }
}
