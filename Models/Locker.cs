using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentWebsite.Models
{
    public class Locker
    {
        [Key]
        public int LOCK_Id { get; set; }

        public string LOCK_Spot { get; set; }  // e.g., "A1", "B2", etc.

        public bool LOCK_IsAvailable { get; set; } = true;

        public DateTime LOCK_DateCreated { get; set; }


        // Foreign key to Student
        public string STUD_StudentId { get; set; }
        // Navigation properties
        [ForeignKey("STUD_StudentId")]
        public virtual Student Student { get; set; }
        
    }
}