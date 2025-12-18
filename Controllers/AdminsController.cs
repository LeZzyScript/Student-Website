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
    public class AdminsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminsController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class AdminDto
        {
            public string UserId { get; set; }
            public string Name { get; set; }
            public string Password { get; set; }
        }

        public class AdminListItem
        {
            public int AccIndex { get; set; }
            public string AccUserId { get; set; }
            public string Name { get; set; }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdminListItem>>> GetAll()
        {
            // For now, store admin "name" in ACC_Role extra info is not modeled,
            // so we just return role as name placeholder.
            var admins = await _context.Accounts
                .Where(a => a.ACC_Role == "admin")
                .Select(a => new AdminListItem
                {
                    AccIndex = a.ACC_Index,
                    AccUserId = a.ACC_UserId,
                    Name = "Admin"
                })
                .ToListAsync();

            return Ok(admins);
        }

        [HttpPost]
        public async Task<ActionResult<AdminListItem>> Create([FromBody] AdminDto dto)
        {
            if (dto == null ||
                string.IsNullOrWhiteSpace(dto.UserId) ||
                string.IsNullOrWhiteSpace(dto.Name) ||
                string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest("All fields are required.");
            }

            var existing = await _context.Accounts
                .FirstOrDefaultAsync(a => a.ACC_UserId == dto.UserId);

            if (existing != null)
            {
                return Conflict("User ID is already taken.");
            }

            var account = new Account
            {
                ACC_UserId = dto.UserId,
                ACC_Password = dto.Password, // TODO: hash in real app
                ACC_Role = "admin"
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            var result = new AdminListItem
            {
                AccIndex = account.ACC_Index,
                AccUserId = account.ACC_UserId,
                Name = dto.Name
            };

            return CreatedAtAction(nameof(GetAll), new { id = result.AccIndex }, result);
        }

        [HttpDelete("{accIndex:int}")]
        public async Task<IActionResult> Delete(int accIndex)
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.ACC_Index == accIndex && a.ACC_Role == "admin");

            if (account == null)
            {
                return NotFound();
            }

            _context.Accounts.Remove(account);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}


