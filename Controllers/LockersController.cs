using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentWebsite.Data;
using StudentWebsite.Models;

namespace StudentWebsite.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LockersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LockersController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class LockerReservationRequest
        {
            // Visible student ID, e.g. "25012325"
            public string StudStudentId { get; set; }
            // Locker spot like "A1"
            public string Spot { get; set; }
        }

        [HttpPost("reserve")]
        public async Task<ActionResult<Locker>> Reserve([FromBody] LockerReservationRequest request)
        {
            if (request == null ||
                string.IsNullOrWhiteSpace(request.StudStudentId) ||
                string.IsNullOrWhiteSpace(request.Spot))
            {
                return BadRequest("Student ID and locker spot are required.");
            }

            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.STUD_StudentId == request.StudStudentId);

            if (student == null)
            {
                return NotFound("Student not found.");
            }

            // Optional: ensure spot is not already reserved
            var existing = await _context.Lockers
                .FirstOrDefaultAsync(l => l.LOCK_Spot == request.Spot);
            if (existing != null && !existing.LOCK_IsAvailable)
            {
                return Conflict("Locker spot is already reserved.");
            }

            var locker = new Locker
            {
                STUD_Id = student.STUD_Id,
                LOCK_Spot = request.Spot,
                LOCK_DateCreated = DateTime.UtcNow,
                LOCK_IsAvailable = false
            };

            _context.Lockers.Add(locker);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Reserve), new { id = locker.LOCK_Id }, locker);
        }
    }
}


