using Microsoft.AspNetCore.Mvc;

namespace StudentWebsite.Controllers
{
    [ApiController]
    [Route("api/test")]
    public class Test : Controller
    {
        [HttpGet]
        public IActionResult Get() => Ok("API is running");
    }
}
