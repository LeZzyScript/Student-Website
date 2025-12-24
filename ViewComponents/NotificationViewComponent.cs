using Microsoft.AspNetCore.Mvc;

namespace StudentWebsite.ViewComponents
{
    public class NotificationViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke()
        {
            var notification = TempData["Notification"]?.ToString();
            var notificationType = TempData["NotificationType"]?.ToString() ?? "success";
            
            if (!string.IsNullOrEmpty(notification))
            {
                ViewBag.Notification = notification;
                ViewBag.NotificationType = notificationType;
            }
            
            return View();
        }
    }
}
