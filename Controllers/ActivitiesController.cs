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
    public class ActivitiesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ActivitiesController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class ActivityRequestDto
        {
            public string StudStudentId { get; set; }
            // For now support a single organizer; frontend can be adapted
            public int OrganizerId { get; set; }
            public string ActivityName { get; set; }
            public string Description { get; set; }
        }

        [HttpPost("request")]
        public async Task<ActionResult<Activity>> RequestActivity([FromBody] ActivityRequestDto request)
        {
            if (request == null ||
                string.IsNullOrWhiteSpace(request.StudStudentId) ||
                string.IsNullOrWhiteSpace(request.ActivityName) ||
                string.IsNullOrWhiteSpace(request.Description))
            {
                return BadRequest("Missing required fields.");
            }

            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.STUD_StudentId == request.StudStudentId);

            if (student == null)
            {
                return NotFound("Student not found.");
            }

            var organizer = await _context.Organizers
                .FirstOrDefaultAsync(o => o.ORG_Id == request.OrganizerId);

            if (organizer == null)
            {
                return NotFound("Organizer not found.");
            }

            var activity = new Activity
            {
                STUD_Id = student.STUD_Id,
                ORG_Id = organizer.ORG_Id,
                ACT_Name = request.ActivityName,
                ACT_Description = request.Description,
                ACT_IsGranted = false
            };

            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(RequestActivity), new { id = activity.ACT_Id }, activity);
        }

        // Simple listing endpoint for admin to see all activities
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Activity>>> GetAll()
        {
            var activities = await _context.Activities
                .Include(a => a.Student)
                .Include(a => a.Organizer)
                .ToListAsync();

            return Ok(activities);
        }
    }
}


