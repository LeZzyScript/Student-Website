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

        public ParkingController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class ParkingReservationRequest
        {
            public string StudStudentId { get; set; }
            public string Spot { get; set; }
            public string VehicleType { get; set; }
            public string VehicleModel { get; set; }
            public string Schedule { get; set; } // "am" or "pm" from frontend
            public DateTime ReservationDate { get; set; }
            public DateTime ExpiryDate { get; set; }
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
                    pARK_ReservationDate = p.PARK_ReservationDate,
                    pARK_ExpiryDate = p.PARK_ExpiryDate,
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
                string.IsNullOrWhiteSpace(request.StudStudentId) ||
                string.IsNullOrWhiteSpace(request.Spot) ||
                string.IsNullOrWhiteSpace(request.VehicleType) ||
                string.IsNullOrWhiteSpace(request.VehicleModel) ||
                string.IsNullOrWhiteSpace(request.Schedule))
            {
                return BadRequest("All fields are required.");
            }

            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.STUD_StudentId == request.StudStudentId);

            if (student == null)
            {
                return NotFound("Student not found.");
            }

            var existing = await _context.Parkings
                .FirstOrDefaultAsync(p => p.PARK_Spot == request.Spot);
            if (existing != null && !existing.PARK_IsAvailable)
            {
                return Conflict("Parking spot is already reserved.");
            }

            var parking = new Parking
            {
                STUD_Id = student.STUD_Id,
                PARK_Spot = request.Spot,
                PARK_VehicleType = request.VehicleType,
                PARK_VehicleModel = request.VehicleModel,
                PARK_Schedule = request.Schedule.ToUpperInvariant(), // "AM"/"PM"
                PARK_DateCreated = DateTime.UtcNow,
                PARK_ReservationDate = request.ReservationDate,
                PARK_ExpiryDate = request.ExpiryDate,
                PARK_IsAvailable = false
            };

            _context.Parkings.Add(parking);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Reserve), new { id = parking.PARK_Id }, parking);
        }
    }
}


