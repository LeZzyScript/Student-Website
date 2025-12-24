using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentWebsite.Data;
using StudentWebsite.Models;
using Microsoft.AspNetCore.Cors;

namespace StudentWebsite.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LockersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<LockersController> _logger;

        public LockersController(ApplicationDbContext context, ILogger<LockersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        public class LockerReservationRequest
        {
            // Student ID (string format)
            public string StudId { get; set; }
            // Locker spot like "A1"
            public string Spot { get; set; }
        }

        [HttpGet]
        [EnableCors("AllowFrontend")] 
        public async Task<ActionResult<IEnumerable<object>>> GetLockers()
        {
            Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:8080");
            Response.Headers.Add("Access-Control-Allow-Credentials", "true");
        return await _context.Lockers
            .Include(l => l.Student)
            .Select(l => new 
            {
            id = l.LOCK_Id,
            spotNumber = l.LOCK_Spot,
            isAvailable = l.LOCK_IsAvailable,
            student = l.Student != null ? new 
            {
                id = l.Student.STUD_StudentId,
                studentId = l.Student.STUD_StudentId,
                name = $"{l.Student.STUD_FName} {l.Student.STUD_LName}",
                course = l.Student.STUD_Course,
                yearLevel = l.Student.STUD_YearLevel
            } : null,
            dateCreated = l.LOCK_DateCreated
            })
            .ToListAsync();
        }

        [HttpPost("reserve")]
        public async Task<ActionResult<Locker>> Reserve([FromBody] LockerReservationRequest request)
        {
            try
            {
                if (request == null ||
                    string.IsNullOrWhiteSpace(request.StudId) ||
                    string.IsNullOrWhiteSpace(request.Spot))
                {
                    return BadRequest(new { 
                        success = false,
                        message = "Student ID and locker spot are required." 
                    });
                }

                // First check if student has active parking
                var hasActiveParking = await _context.Parkings
                    .Include(p => p.Student)
                    .AnyAsync(p => p.STUD_StudentId == request.StudId && 
                                !p.PARK_IsAvailable);
                if (!hasActiveParking)
                {
                    return BadRequest(new { 
                        success = false, 
                        message = "You must have an active parking reservation to reserve a locker." 
                    });
                }

                var student = await _context.Students
                    .FirstOrDefaultAsync(s => s.STUD_StudentId == request.StudId);

                if (student == null)
                {
                    return NotFound(new { 
                        success = false,
                        message = "Student not found." 
                    });
                }

                // Check if spot is already reserved
                var existing = await _context.Lockers
                    .FirstOrDefaultAsync(l => l.LOCK_Spot == request.Spot);
                    
                if (existing != null && !existing.LOCK_IsAvailable)
                {
                    return Conflict(new { 
                        success = false,
                        message = "Locker spot is already reserved." 
                    });
                }

                var locker = new Locker
                {
                    STUD_StudentId = student.STUD_StudentId,
                    LOCK_Spot = request.Spot,
                    LOCK_DateCreated = DateTime.UtcNow,
                    LOCK_IsAvailable = false
                };

                // Locker status is now part of the Locker entity
                // No need for separate status table

                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    _context.Lockers.Add(locker);
                    await _context.SaveChangesAsync();
                    
                    await transaction.CommitAsync();

                    return CreatedAtAction(nameof(Reserve), new { id = locker.LOCK_Id }, new {
                        success = true,
                        message = "Locker reserved successfully.",
                        data = new {
                            locker.LOCK_Id,
                            locker.LOCK_Spot,
                            locker.LOCK_DateCreated,
                            studentId = student.STUD_StudentId,
                            studentName = $"{student.STUD_FName} {student.STUD_LName}"
                        }
                    });
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reserving locker for student ID {StudentId}", request?.StudId);
                return StatusCode(500, new { 
                    success = false,
                    message = "An error occurred while processing your request." 
                });
            }
        }
    }
}


