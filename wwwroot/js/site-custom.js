// Prevent back button from logging out
history.pushState(null, null, document.URL);
window.addEventListener('popstate', function () {
    history.pushState(null, null, document.URL);
});

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.role = 'alert';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.getElementById('notification-container');
    if (container) {
        container.appendChild(notification);
        
        // Auto-remove notification after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Show notification from URL parameters
function checkForNotifications() {
    const urlParams = new URLSearchParams(window.location.search);
    const notification = urlParams.get('notification');
    const notificationType = urlParams.get('notificationType') || 'success';
    
    if (notification) {
        showNotification(decodeURIComponent(notification), notificationType);
        
        // Clean URL
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', function() {
    checkForNotifications();
});
