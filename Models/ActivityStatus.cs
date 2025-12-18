using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentWebsite.Models
{
    public class ActivityStatus
    {
        [Key]
        public int ACT_StatusId { get; set; }

        [Required]
        public int ACT_Id { get; set; }

        [ForeignKey(nameof(ACT_Id))]
        public Activity Activity { get; set; }

        // Admin account that approved/declined
        [Required]
        public int ACC_Index { get; set; }

        [ForeignKey(nameof(ACC_Index))]
        public Account Account { get; set; }

        [Required]
        public bool ACT_IsGranted { get; set; }

        [Required]
        [MaxLength(100)]
        public string ACT_Notify { get; set; }
    }
}