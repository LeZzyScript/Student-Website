using System;
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
    public class AccountsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AccountsController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class RegisterRequest
        {
            public string UserId { get; set; }
            public string Password { get; set; }
            public string FirstName { get; set; }
            public string MiddleInitial { get; set; }
            public string LastName { get; set; }
            public int YearLevel { get; set; }
            public string Course { get; set; }
        }

        public class RegisterResponse
        {
            public int AccIndex { get; set; }
            public string AccUserId { get; set; }
            public string AccRole { get; set; }
            public int StudId { get; set; }
            public string StudStudentId { get; set; }
            public int StudYearLevel { get; set; }
            public string StudCourse { get; set; }
        }

        public class LoginRequest
        {
            public string UserId { get; set; }
            public string Password { get; set; }
        }

        public class LoginResponse
        {
            public string Role { get; set; }
            public string AccUserId { get; set; }
            public int AccIndex { get; set; }

            // Student info (if role == "student")
            public string StudStudentId { get; set; }
            public string StudFirstName { get; set; }
            public string StudMiddleInitial { get; set; }
            public string StudLastName { get; set; }
            public int? StudYearLevel { get; set; }
            public string StudCourse { get; set; }
        }

        [HttpPost("register")]
        public async Task<ActionResult<RegisterResponse>> Register([FromBody] RegisterRequest request)
        {
            if (request == null ||
                string.IsNullOrWhiteSpace(request.UserId) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.FirstName) ||
                string.IsNullOrWhiteSpace(request.LastName) ||
                string.IsNullOrWhiteSpace(request.Course))
            {
                return BadRequest("Missing required fields.");
            }

            if (request.YearLevel <= 0)
            {
                return BadRequest("Year level must be greater than zero.");
            }

            // Check if the userId is already taken
            var existingAccount = await _context.Accounts
                .FirstOrDefaultAsync(a => a.ACC_UserId == request.UserId);

            if (existingAccount != null)
            {
                return Conflict("User ID is already taken.");
            }

            // TODO: hash password in a real application
            var account = new Account
            {
                ACC_UserId = request.UserId,
                ACC_Password = request.Password,
                ACC_Role = "student"
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            // Generate a visible student ID similar to the frontend logic
            var year = DateTime.UtcNow.Year;
            var yearPrefix = (year % 100).ToString("00");
            var random = Random.Shared.Next(1, 900);
            var padded = random.ToString("000");
            var studentId = $"{yearPrefix}{padded}{yearPrefix}";

            var student = new Student
            {
                STUD_FName = request.FirstName,
                STUD_MiddleI = string.IsNullOrWhiteSpace(request.MiddleInitial)
                    ? null
                    : request.MiddleInitial.Trim().ToUpperInvariant().Substring(0, 1),
                STUD_LName = request.LastName,
                STUD_StudentId = studentId,
                STUD_YearLevel = request.YearLevel,
                STUD_Course = request.Course,
                ACC_Index = account.ACC_Index
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            var response = new RegisterResponse
            {
                AccIndex = account.ACC_Index,
                AccUserId = account.ACC_UserId,
                AccRole = account.ACC_Role,
                StudId = student.STUD_Id,
                StudStudentId = student.STUD_StudentId,
                StudYearLevel = student.STUD_YearLevel,
                StudCourse = student.STUD_Course
            };

            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            if (request == null ||
                string.IsNullOrWhiteSpace(request.UserId) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Missing credentials.");
            }

            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.ACC_UserId == request.UserId);

            if (account == null || account.ACC_Password != request.Password)
            {
                return Unauthorized("Invalid credentials.");
            }

            var response = new LoginResponse
            {
                Role = account.ACC_Role,
                AccUserId = account.ACC_UserId,
                AccIndex = account.ACC_Index
            };

            if (account.ACC_Role == "student")
            {
                var student = await _context.Students
                    .FirstOrDefaultAsync(s => s.ACC_Index == account.ACC_Index);

                if (student != null)
                {
                    response.StudStudentId = student.STUD_StudentId;
                    response.StudFirstName = student.STUD_FName;
                    response.StudMiddleInitial = student.STUD_MiddleI;
                    response.StudLastName = student.STUD_LName;
                    response.StudYearLevel = student.STUD_YearLevel;
                    response.StudCourse = student.STUD_Course;
                }
            }

            return Ok(response);
        }
    }
}


