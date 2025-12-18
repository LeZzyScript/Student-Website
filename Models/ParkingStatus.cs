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

        [ForeignKey(nameof(PARK_Id))]
        public Parking Parking { get; set; }

        // Admin account who performed the action
        [Required]
        public int ACC_Index { get; set; }

        [ForeignKey(nameof(ACC_Index))]
        public Account Account { get; set; }

        [Required]
        public bool PARK_IsAvailable { get; set; }

        [Required]
        [MaxLength(100)]
        public string PARK_Notify { get; set; }
    }
}