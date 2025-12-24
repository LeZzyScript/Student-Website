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
    public class ActivityController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ActivityController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetActivities()
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
                        a.Student.STUD_FirstName,
                        a.Student.STUD_LastName
                    } : null,
                    Organizer = a.Organizer != null ? new 
                    {
                        a.Organizer.ORG_Organization
                    } : null
                })
                .ToListAsync();

            return Ok(activities);
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveActivity(int id)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null)
            {
                return NotFound();
            }

            activity.ACT_IsGranted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id}/decline")]
        public async Task<IActionResult> DeclineActivity(int id)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null)
            {
                return NotFound();
            }

            activity.ACT_IsGranted = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
