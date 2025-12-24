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
    public class OrganizerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrganizerController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetOrganizers()
        {
            var organizers = await _context.Organizers
                .Select(o => new 
                {
                    o.ORG_Id,
                    o.ORG_FName,
                    o.ORG_MiddleI,
                    o.ORG_LName,
                    o.ORG_Organization
                })
                .ToListAsync();

            return Ok(organizers);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetOrganizer(int id)
        {
            var organizer = await _context.Organizers
                .Where(o => o.ORG_Id == id)
                .Select(o => new 
                {
                    o.ORG_Id,
                    o.ORG_FName,
                    o.ORG_MiddleI,
                    o.ORG_LName,
                    o.ORG_Organization
                })
                .FirstOrDefaultAsync();

            if (organizer == null)
            {
                return NotFound();
            }

            return organizer;
        }

        [HttpPost]
        public async Task<ActionResult<Organizer>> CreateOrganizer([FromBody] Organizer organizer)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Organizers.Add(organizer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOrganizer), new { id = organizer.ORG_Id }, organizer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrganizer(int id, [FromBody] Organizer organizerUpdate)
        {
            if (id != organizerUpdate.ORG_Id)
            {
                return BadRequest();
            }

            var organizer = await _context.Organizers.FindAsync(id);
            if (organizer == null)
            {
                return NotFound();
            }

            organizer.ORG_FName = organizerUpdate.ORG_FName;
            organizer.ORG_MiddleI = organizerUpdate.ORG_MiddleI;
            organizer.ORG_LName = organizerUpdate.ORG_LName;
            organizer.ORG_Organization = organizerUpdate.ORG_Organization;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrganizerExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrganizer(int id)
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

        private bool OrganizerExists(int id)
        {
            return _context.Organizers.Any(e => e.ORG_Id == id);
        }
    }
}
