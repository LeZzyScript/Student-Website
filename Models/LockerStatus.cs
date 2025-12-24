using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentWebsite.Models
{
    public class LockerStatus
    {
        [Key]
        public int LOCKSTATUS_Id { get; set; }
        public int LOCK_Id { get; set; }
        public string Status { get; set; }
        public DateTime StatusDate { get; set; }
        public string Notes { get; set; }
        [ForeignKey("LOCK_Id")]
        public virtual Locker Locker { get; set; }
    }
}