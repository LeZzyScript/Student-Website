using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace StudentWebsite.Models
{
    public class Activity
    {
        [Key]
        public int ACT_Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string ACT_Name { get; set; }
        
        [Required]
        public string ACT_Description { get; set; }
        
        [Required]
        public DateTime ACT_DateCreated { get; set; }  // Published date
        
        [Required]
        public DateTime ACT_ScheduledDate { get; set; }  // Scheduled date
        
        [Required]
        public bool ACT_IsGranted { get; set; }
        
        // Foreign keys
        public string STUD_StudentId { get; set; }
        [ForeignKey("STUD_StudentId")]
        public virtual Student Student { get; set; }
        
        public int ORG_Id { get; set; }
        [ForeignKey("ORG_Id")]
        public virtual Organizer Organizer { get; set; }
    }
}