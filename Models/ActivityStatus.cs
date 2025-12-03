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
        [ForeignKey("ACT_Id")]
        public Activity Activity { get; set; }

        [Required]
        public int ADMIN_Id { get; set; }

        [ForeignKey("ADMIN_Id")]
        public Admin Admin { get; set; }

        [Required]
        public bool ACT_IsGranted { get; set; }

        [Required, MaxLength(100)]
        public string ACT_Notify { get; set; }
    }
}
