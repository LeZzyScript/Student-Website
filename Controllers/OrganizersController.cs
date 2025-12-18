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
    public class OrganizersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrganizersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Organizer>>> GetAll()
        {
            var organizers = await _context.Organizers.ToListAsync();
            return Ok(organizers);
        }

        public class OrganizerDto
        {
            public string FirstName { get; set; }
            public string MiddleInitial { get; set; }
            public string LastName { get; set; }
            public string Organization { get; set; }
        }

        [HttpPost]
        public async Task<ActionResult<Organizer>> Create([FromBody] OrganizerDto dto)
        {
            if (dto == null ||
                string.IsNullOrWhiteSpace(dto.FirstName) ||
                string.IsNullOrWhiteSpace(dto.LastName) ||
                string.IsNullOrWhiteSpace(dto.Organization))
            {
                return BadRequest("Required fields are missing.");
            }

            var organizer = new Organizer
            {
                ORG_FName = dto.FirstName,
                ORG_MiddleI = string.IsNullOrWhiteSpace(dto.MiddleInitial) ? null : dto.MiddleInitial,
                ORG_LName = dto.LastName,
                ORG_Organization = dto.Organization
            };

            _context.Organizers.Add(organizer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = organizer.ORG_Id }, organizer);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<Organizer>> Update(int id, [FromBody] OrganizerDto dto)
        {
            var organizer = await _context.Organizers.FindAsync(id);
            if (organizer == null)
            {
                return NotFound();
            }

            if (dto == null ||
                string.IsNullOrWhiteSpace(dto.FirstName) ||
                string.IsNullOrWhiteSpace(dto.LastName) ||
                string.IsNullOrWhiteSpace(dto.Organization))
            {
                return BadRequest("Required fields are missing.");
            }

            organizer.ORG_FName = dto.FirstName;
            organizer.ORG_MiddleI = string.IsNullOrWhiteSpace(dto.MiddleInitial) ? null : dto.MiddleInitial;
            organizer.ORG_LName = dto.LastName;
            organizer.ORG_Organization = dto.Organization;

            await _context.SaveChangesAsync();

            return Ok(organizer);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var organizer = await _context.Organizers.FindAsync(id);
            if (organizer == null)
            {
                return NotFound();
            }

            _context.Organizers.Remove(organizer);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}


