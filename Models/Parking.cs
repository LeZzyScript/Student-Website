using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentWebsite.Models
{
    public class Parking
    {
        [Key]
        public int PARK_Id { get; set; }

        [Required]
        public int STUD_Id { get; set; }

        [ForeignKey("STUD_Id")]
        public Student Student { get; set; }

        [Required, MaxLength(2)]
        public string PARK_Spot { get; set; }

        [Required, MaxLength(30)]
        public string PARK_VehicleType { get; set; }

        [Required, MaxLength(30)]
        public string PARK_VehicleModel { get; set; }

        [Required, MaxLength(2)]
        public string PARK_Schedule { get; set; } //AM OR PM

        [Required]
        public DateTime PARK_DateCreated { get; set; }

        [Required]
        public bool PARK_IsAvailable { get; set; }
    }
}
