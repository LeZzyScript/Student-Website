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
            public int OrganizerId { get; set; }
            public string ActivityName { get; set; }
            public string Description { get; set; }
            public DateTime ScheduledDate { get; set; }
        }

        [HttpPost("request")]
        public async Task<ActionResult<Activity>> RequestActivity([FromBody] ActivityRequestDto request)
        {
            if (request == null ||
                string.IsNullOrWhiteSpace(request.StudStudentId) ||
                string.IsNullOrWhiteSpace(request.ActivityName) ||
                string.IsNullOrWhiteSpace(request.Description) ||
                request.ScheduledDate == default)
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
                ACT_ScheduledDate = request.ScheduledDate,
                ACT_DateCreated = DateTime.UtcNow,
                ACT_IsGranted = false
            };

            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(RequestActivity), new { id = activity.ACT_Id }, activity);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAll()
        {
            var activities = await _context.Activities
                .Include(a => a.Student)
                .Include(a => a.Organizer)
                .Select(a => new 
                {
                    a.ACT_Id,
                    a.ACT_Name,
                    a.ACT_Description,
                    a.ACT_DateCreated,
                    a.ACT_ScheduledDate,
                    a.ACT_IsGranted,
                    Student = a.Student != null ? new 
                    {
                        a.Student.STUD_StudentId,
                        STUD_FirstName = a.Student.STUD_FName,
                        STUD_LastName = a.Student.STUD_LName
                    } : null,
                    Organizer = a.Organizer != null ? a.Organizer.ORG_Organization : null
                })
                .ToListAsync();

            return Ok(activities);
        }
    }
}

