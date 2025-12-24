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
    public class ActivitiesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ActivitiesController> _logger;

        public ActivitiesController(ApplicationDbContext context, ILogger<ActivitiesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        public class ActivityRequestDto
        {
            public string? StudStudentId { get; set; }
            public int OrganizerId { get; set; }
            public string? ActivityName { get; set; }
            public string? Description { get; set; }
            public DateTime ScheduledDate { get; set; }
        }

        [HttpPost("request")]
        public async Task<ActionResult<object>> RequestActivity([FromBody] ActivityRequestDto request)
        {
            try
            {
                _logger.LogInformation("Received activity request: {@Request}", request);

                if (request == null)
                {
                    _logger.LogWarning("Request body is null");
                    return BadRequest(new { message = "Request body cannot be null" });
                }

                // Log each property to help with debugging
                _logger.LogInformation("StudStudentId: {StudStudentId}", request.StudStudentId);
                _logger.LogInformation("OrganizerId: {OrganizerId}", request.OrganizerId);
                _logger.LogInformation("ActivityName: {ActivityName}", request.ActivityName);
                _logger.LogInformation("Description: {Description}", request.Description);
                _logger.LogInformation("ScheduledDate: {ScheduledDate}", request.ScheduledDate);

                if (string.IsNullOrWhiteSpace(request.StudStudentId) ||
                    string.IsNullOrWhiteSpace(request.ActivityName) ||
                    string.IsNullOrWhiteSpace(request.Description) ||
                    request.ScheduledDate == default)
                {
                    _logger.LogWarning("Missing required fields in request: {@Request}", request);
                    return BadRequest(new { message = "Missing required fields." });
                }

                var student = await _context.Students
                    .FirstOrDefaultAsync(s => s.STUD_StudentId == request.StudStudentId);

                if (student == null)
                {
                    _logger.LogWarning("Student not found with ID: {StudentId}", request.StudStudentId);
                    return NotFound(new { message = $"Student with ID {request.StudStudentId} not found." });
                }

                var organizer = await _context.Organizers
                    .FirstOrDefaultAsync(o => o.ORG_Id == request.OrganizerId);

                if (organizer == null)
                {
                    _logger.LogWarning("Organizer not found with ID: {OrganizerId}", request.OrganizerId);
                    return NotFound(new { message = $"Organizer with ID {request.OrganizerId} not found." });
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

                _logger.LogInformation("Activity created successfully with ID: {ActivityId}", activity.ACT_Id);
                
                // Create initial status with default admin (ID: 1)
                // In a production environment, you should get the current admin's ID from the authentication context
                var defaultAdminId = 1; // Replace with actual admin ID or get from user context
                
                var status = new ActivityStatus
                {
                    ACT_Id = activity.ACT_Id,
                    ACC_Index = defaultAdminId,
                    ACT_IsGranted = false, // Default to false (pending)
                    ACT_Notify = "Activity request submitted and pending approval"
                };
                
                _context.ActivityStatuses.Add(status);
                await _context.SaveChangesAsync();
                
                return Ok(new 
                {
                    message = "Activity request submitted successfully!",
                    activity = new 
                    {
                        activity.ACT_Id,
                        activity.ACT_Name,
                        activity.ACT_Description,
                        activity.ACT_DateCreated,
                        activity.ACT_ScheduledDate,
                        activity.ACT_IsGranted,
                        Student = new { student.STUD_StudentId, STUD_FirstName = student.STUD_FName, STUD_LastName = student.STUD_LName },
                        Organizer = new { organizer.ORG_Organization, organizer.ORG_FName, organizer.ORG_LName },
                        Status = "Pending"
                    }
                });
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error while creating activity. Inner exception: {InnerException}", 
                    dbEx.InnerException?.Message);
                return StatusCode(500, new { message = "A database error occurred while saving the activity." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing activity request: {Message}", ex.Message);
                return StatusCode(500, new { message = "An error occurred while processing your request." });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Fetching all activities");
                
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
                        Organizer = a.Organizer != null ? new 
                        {
                            a.Organizer.ORG_Id,
                            a.Organizer.ORG_Organization,
                            a.Organizer.ORG_FName,
                            a.Organizer.ORG_LName
                        } : null
                    })
                    .ToListAsync();

                _logger.LogInformation("Successfully retrieved {Count} activities", activities.Count);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving activities: {Message}", ex.Message);
                return StatusCode(500, "An error occurred while retrieving activities.");
            }
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveActivity(int id)
        {
            try
            {
                _logger.LogInformation("Approving activity with ID: {ActivityId}", id);
                
                var activity = await _context.Activities.FindAsync(id);
                if (activity == null)
                {
                    _logger.LogWarning("Activity not found with ID: {ActivityId}", id);
                    return NotFound($"Activity with ID {id} not found.");
                }

                activity.ACT_IsGranted = true;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Activity with ID {ActivityId} approved successfully", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving activity with ID {ActivityId}: {Message}", id, ex.Message);
                return StatusCode(500, "An error occurred while approving the activity.");
            }
        }

        [HttpPut("{id}/decline")]
        public async Task<IActionResult> DeclineActivity(int id)
        {
            try
            {
                _logger.LogInformation("Declining activity with ID: {ActivityId}", id);
                
                var activity = await _context.Activities.FindAsync(id);
                if (activity == null)
                {
                    _logger.LogWarning("Activity not found with ID: {ActivityId}", id);
                    return NotFound($"Activity with ID {id} not found.");
                }

                activity.ACT_IsGranted = false;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Activity with ID {ActivityId} declined successfully", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error declining activity with ID {ActivityId}: {Message}", id, ex.Message);
                return StatusCode(500, "An error occurred while declining the activity.");
            }
        }
    }
}

