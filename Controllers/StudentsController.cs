using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentWebsite.Data;

namespace StudentWebsite.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StudentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class StudentListItem
        {
            public int StudId { get; set; }
            public string StudStudentId { get; set; }
            public int YearLevel { get; set; }
            public string Course { get; set; }
            public string AccUserId { get; set; }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StudentListItem>>> GetAll()
        {
            var students = await _context.Students
                .Include(s => s.Account)
                .Select(s => new StudentListItem
                {
                    StudId = s.STUD_Id,
                    StudStudentId = s.STUD_StudentId,
                    YearLevel = s.STUD_YearLevel,
                    Course = s.STUD_Course,
                    AccUserId = s.Account.ACC_UserId
                })
                .ToListAsync();

            return Ok(students);
        }
    }
}


