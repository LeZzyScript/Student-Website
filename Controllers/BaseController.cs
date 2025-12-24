using Microsoft.AspNetCore.Mvc;

namespace StudentWebsite.Controllers
{
    public class BaseController : Controller
    {
        protected IActionResult RedirectWithNotification(string actionName, string message, string notificationType = "success")
        {
            TempData["Notification"] = message;
            TempData["NotificationType"] = notificationType;
            return RedirectToAction(actionName);
        }

        protected IActionResult RedirectWithNotification(string actionName, string controllerName, string message, string notificationType = "success")
        {
            TempData["Notification"] = message;
            TempData["NotificationType"] = notificationType;
            return RedirectToAction(actionName, controllerName);
        }
    }
}
