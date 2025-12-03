using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentWebsite.Models
{
    public class ParkingStatus
    {
        [Key]
        public int PARK_StatusId { get; set; }

        [Required]
        public int PARK_Id { get; set; }
        [ForeignKey("PARK_Id")]
        public Parking Parking { get; set; }

        [Required]
        public int ADMIN_Id { get; set; }
        [ForeignKey("ADMIN_Id")]
        public Admin Admin { get; set; }
        
        [Required]
        public bool PARK_IsAvailable { get; set; }

        [Required, MaxLength(100)]
        public string PARK_Notify { get; set; }

    }
}
