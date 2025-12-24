using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StudentWebsite.Data;
using StudentWebsite.Models;

namespace StudentWebsite.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrganizersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<OrganizersController> _logger;

        public OrganizersController(ApplicationDbContext context, ILogger<OrganizersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/organizers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetOrganizers()
        {
            try
            {
                var organizers = await _context.Organizers
                    .Select(o => new 
                    {
                        org_Id = o.ORG_Id,
                        org_FName = o.ORG_FName,
                        org_MiddleI = o.ORG_MiddleI,
                        org_LName = o.ORG_LName,
                        org_Organization = o.ORG_Organization,
                        activityCount = o.Activities != null ? o.Activities.Count : 0
                    })
                    .ToListAsync();

                return Ok(organizers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting organizers");
                return StatusCode(500, "An error occurred while retrieving organizers.");
            }
        }

        // GET: api/organizers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetOrganizer(int id)
        {
            try
            {
                var organizer = await _context.Organizers
                    .Where(o => o.ORG_Id == id)
                    .Select(o => new 
                    {
                        org_Id = o.ORG_Id,
                        org_FName = o.ORG_FName,
                        org_MiddleI = o.ORG_MiddleI,
                        org_LName = o.ORG_LName,
                        org_Organization = o.ORG_Organization,
                        Activities = o.Activities.Select(a => new 
                        {
                            act_Id = a.ACT_Id,
                            act_Name = a.ACT_Name,
                            act_ScheduledDate = a.ACT_ScheduledDate,
                            act_IsGranted = a.ACT_IsGranted
                        })
                    })
                    .FirstOrDefaultAsync();

                if (organizer == null)
                {
                    return NotFound($"Organizer with ID {id} not found.");
                }

                return organizer;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting organizer with ID {id}");
                return StatusCode(500, "An error occurred while retrieving the organizer.");
            }
        }

        // POST: api/organizers
        [HttpPost]
        public async Task<ActionResult<Organizer>> CreateOrganizer([FromBody] OrganizerDto organizerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var organizer = new Organizer
                {
                    ORG_FName = organizerDto.ORG_FName,
                    ORG_MiddleI = organizerDto.ORG_MiddleI,
                    ORG_LName = organizerDto.ORG_LName,
                    ORG_Organization = organizerDto.ORG_Organization
                };

                _context.Organizers.Add(organizer);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetOrganizer), new { id = organizer.ORG_Id }, new 
                {
                    org_Id = organizer.ORG_Id,
                    org_FName = organizer.ORG_FName,
                    org_MiddleI = organizer.ORG_MiddleI,
                    org_LName = organizer.ORG_LName,
                    org_Organization = organizer.ORG_Organization
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating organizer");
                return StatusCode(500, "An error occurred while creating the organizer.");
            }
        }

        // PUT: api/organizers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrganizer(int id, [FromBody] OrganizerDto organizerDto)
        {
            try
            {
                var organizer = await _context.Organizers.FindAsync(id);
                if (organizer == null)
                {
                    return NotFound($"Organizer with ID {id} not found.");
                }

                // Update properties
                organizer.ORG_FName = organizerDto.ORG_FName;
                organizer.ORG_MiddleI = organizerDto.ORG_MiddleI;
                organizer.ORG_LName = organizerDto.ORG_LName;
                organizer.ORG_Organization = organizerDto.ORG_Organization;

                _context.Entry(organizer).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                if (!OrganizerExists(id))
                {
                    return NotFound($"Organizer with ID {id} no longer exists.");
                }
                _logger.LogError(ex, $"Concurrency error updating organizer with ID {id}");
                return StatusCode(500, "A concurrency error occurred while updating the organizer.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating organizer with ID {id}");
                return StatusCode(500, "An error occurred while updating the organizer.");
            }
        }

        // DELETE: api/organizers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrganizer(int id)
        {
            try
            {
                var organizer = await _context.Organizers
                    .Include(o => o.Activities)
                    .FirstOrDefaultAsync(o => o.ORG_Id == id);

                if (organizer == null)
                {
                    return NotFound($"Organizer with ID {id} not found.");
                }

                // Delete all associated activities first
                if (organizer.Activities != null && organizer.Activities.Any())
                {
                    _context.Activities.RemoveRange(organizer.Activities);
                    await _context.SaveChangesAsync();
                }

                _context.Organizers.Remove(organizer);
                await _context.SaveChangesAsync();

                _logger.LogInformation(
                    "Organizer {OrganizationName} (ID: {OrganizerId}) and {ActivityCount} associated activities were deleted.",
                    organizer.ORG_Organization, 
                    organizer.ORG_Id, 
                    organizer.Activities?.Count ?? 0
                );

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting organizer with ID {id}");
                return StatusCode(500, new 
                { 
                    message = "An error occurred while deleting the organizer.",
                    details = ex.InnerException?.Message ?? ex.Message
                });
            }
        }

        private bool OrganizerExists(int id)
        {
            return _context.Organizers.Any(e => e.ORG_Id == id);
        }
    }

    // Add this DTO class
    public class OrganizerDto
    {
        public string ORG_FName { get; set; }
        public string ORG_MiddleI { get; set; }
        public string ORG_LName { get; set; }
        public string ORG_Organization { get; set; }
    }
}