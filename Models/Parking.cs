using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentWebsite.Models
{
    public class Parking
    {
        [Key]
        public int PARK_Id { get; set; }

        [Required]
        public required string STUD_StudentId { get; set; }
        [ForeignKey("STUD_StudentId")]
        [InverseProperty("Parking")]
        public virtual Student Student { get; set; }

        // A1, C3, etc.
        [Required]
        [MaxLength(2)]
        public required string PARK_Spot { get; set; }

        // "motorcycle" or "car"
        [Required]
        [MaxLength(30)]
        public required string PARK_VehicleType { get; set; }

        [Required]
        [MaxLength(30)]
        public required string PARK_VehicleModel { get; set; }

        // Store "AM"/"PM" – convert from "am"/"pm" in the controller
        [Required]
        [MaxLength(2)]
        public required string PARK_Schedule { get; set; }

        [Required]
        public DateTime PARK_DateCreated { get; set; }

        [Required]
        public bool PARK_IsAvailable { get; set; } = true;
    }
}