using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentWebsite.Models
{
    public class Locker
    {
        [Key]
        public int LOCK_Id { get; set; }

        [Required]
        public int STUD_Id { get; set; }

        [ForeignKey(nameof(STUD_Id))]
        public Student Student { get; set; }

        // A1, B5, etc.
        [Required]
        [MaxLength(2)]
        public string LOCK_Spot { get; set; }

        [Required]
        public DateTime LOCK_DateCreated { get; set; }

        [Required]
        public bool LOCK_IsAvailable { get; set; }
    }
}