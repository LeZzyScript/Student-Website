using System;
using System.Collections.Generic;
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
    public class ParkingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ParkingController> _logger;

        public ParkingController(ApplicationDbContext context, ILogger<ParkingController> logger)
        {
            _context = context;
            _logger = logger;
        }

        public class ParkingReservationRequest
        {
            public string StudId { get; set; }  // Changed to string to match STUD_StudentId
            public string Spot { get; set; }
            public string VehicleType { get; set; }
            public string VehicleModel { get; set; }
            public string Schedule { get; set; } // "am" or "pm" from frontend
        }

        [HttpGet("spots")]
        public async Task<ActionResult<IEnumerable<object>>> GetParkingSpots()
        {
            var spots = await _context.Parkings
                .Include(p => p.Student)
                .Select(p => new 
                {
                    pARK_Spot = p.PARK_Spot,
                    pARK_IsAvailable = p.PARK_IsAvailable,
                    pARK_VehicleType = p.PARK_VehicleType,
                    pARK_VehicleModel = p.PARK_VehicleModel,
                    pARK_Schedule = p.PARK_Schedule,
                    pARK_DateCreated = p.PARK_DateCreated,
                    student = p.Student != null ? new 
                    {
                        sTUD_StudentId = p.Student.STUD_StudentId,
                        sTUD_FirstName = p.Student.STUD_FName,
                        sTUD_LastName = p.Student.STUD_LName,
                        sTUD_Course = p.Student.STUD_Course
                    } : null
                })
                .ToListAsync();

            return Ok(spots);
        }

        [HttpPost("reserve")]
    public async Task<ActionResult<Parking>> Reserve([FromBody] ParkingReservationRequest request)
    {
    if (request == null ||
        string.IsNullOrWhiteSpace(request.StudId) ||
        string.IsNullOrWhiteSpace(request.Spot) ||
        string.IsNullOrWhiteSpace(request.VehicleType) ||
        string.IsNullOrWhiteSpace(request.VehicleModel) ||
        string.IsNullOrWhiteSpace(request.Schedule))
    {
        return BadRequest("All fields are required.");
    }

    var student = await _context.Students
        .Include(s => s.Parking) // Include the parking relationship
        .FirstOrDefaultAsync(s => s.STUD_StudentId == request.StudId);

    if (student == null)
    {
        return NotFound("Student not found.");
    }

    // Check if student already has a parking spot
    if (student.Parking != null)
    {
        return BadRequest("Student already has a parking reservation.");
    }

    // Check if the spot is already taken
    var existingSpot = await _context.Parkings
        .FirstOrDefaultAsync(p => p.PARK_Spot == request.Spot);
    
    if (existingSpot != null)
    {
        return Conflict("Parking spot is already reserved.");
    }

    var parking = new Parking
    {
        STUD_StudentId = student.STUD_StudentId,
        PARK_Spot = request.Spot,
        PARK_VehicleType = request.VehicleType,
        PARK_VehicleModel = request.VehicleModel,
        PARK_Schedule = request.Schedule.ToUpperInvariant(), // "AM"/"PM"
        PARK_DateCreated = DateTime.UtcNow,
        PARK_IsAvailable = false
    };

    _context.Parkings.Add(parking);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(Reserve), new { id = parking.PARK_Id }, parking);
}
    
    [HttpPost("release/{studentId}")]
    public async Task<IActionResult> ReleaseParking(string studentId)
    {
        var student = await _context.Students
            .Include(s => s.Parking)
            .FirstOrDefaultAsync(s => s.STUD_StudentId == studentId);

        if (student?.Parking == null)
        {
            return NotFound("No active parking reservation found for this student.");
        }

        _context.Parkings.Remove(student.Parking);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // Check if user has made parking reservation
    [HttpGet("check-parking/{studentId}")]
    public async Task<ActionResult<bool>> HasActiveParking(string studentId) 
    {
        try
        {
            var student = await _context.Students
                .Include(s => s.Parking)
                .FirstOrDefaultAsync(s => s.STUD_StudentId == studentId);

            return Ok(student?.Parking != null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking parking status for student {StudentId}", studentId);
            return StatusCode(500, "An error occurred while checking parking status.");
        }
    }

    [HttpGet("check-parking-by-student-id/{studentId}")]
    public async Task<ActionResult<bool>> CheckParkingByStudentId(string studentId)
    {
        var student = await _context.Students
            .Include(s => s.Parking)
            .FirstOrDefaultAsync(s => s.STUD_StudentId == studentId);
            
        return Ok(student?.Parking != null);
    }
    }
}


