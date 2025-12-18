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

        [ForeignKey(nameof(LOCK_Id))]
        public Locker Locker { get; set; }

        // Admin account who performed the action
        [Required]
        public int ACC_Index { get; set; }

        [ForeignKey(nameof(ACC_Index))]
        public Account Account { get; set; }

        [Required]
        public bool LOCK_IsGranted { get; set; }

        [Required]
        [MaxLength(100)]
        public string LOCK_Notify { get; set; }
    }
}