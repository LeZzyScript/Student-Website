import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Car, 
  CalendarPlus, 
  Building2, 
  Lock, 
  Bell, 
  ChevronDown, 
  LogOut,
  Settings,
  ArrowLeft
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserManagement } from "@/components/admin/UserManagement";
import { ParkingManagement } from "@/components/admin/ParkingManagement";
import { ActivityManagement } from "@/components/admin/ActivityManagement";
import { OrganizerManagement } from "@/components/admin/OrganizerManagement";
import { LockerManagement } from "@/components/admin/LockerManagement";

type ActiveSection = "overview" | "users" | "parking" | "activity" | "organizer" | "locker";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const menuItems = [
    {
      id: "users" as const,
      title: "User Management",
      description: "Manage student and admin accounts",
      icon: Users,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      id: "parking" as const,
      title: "Parking Management",
      description: "View and manage parking reservations",
      icon: Car,
      color: "bg-green-500/10 text-green-500",
    },
    {
      id: "activity" as const,
      title: "Activity Management",
      description: "Review and approve activity requests",
      icon: CalendarPlus,
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      id: "organizer" as const,
      title: "Organizer Management",
      description: "Manage campus organizations",
      icon: Building2,
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      id: "locker" as const,
      title: "Locker Management",
      description: "View and manage locker reservations",
      icon: Lock,
      color: "bg-red-500/10 text-red-500",
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return <UserManagement />;
      case "parking":
        return <ParkingManagement />;
      case "activity":
        return <ActivityManagement />;
      case "organizer":
        return <OrganizerManagement />;
      case "locker":
        return <LockerManagement />;
      default:
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="text-left p-6 rounded-xl border bg-card transition-all duration-200 hover:shadow-lg hover:border-primary/30"
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${item.color} mb-4`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </button>
            ))}
          </div>
        );
    }
  };

  const activeItem = menuItems.find((item) => item.id === activeSection);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-destructive flex items-center justify-center">
              <Settings className="h-5 w-5 text-destructive-foreground" />
            </div>
            <h1 className="text-lg font-semibold text-foreground hidden sm:block">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-medium text-accent-foreground flex items-center justify-center">
                5
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 md:px-3">
                  <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <span className="text-destructive font-medium text-sm">AD</span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-foreground">
                    Administrator
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex flex-col items-start">
                  <span className="font-medium">Administrator</span>
                  <span className="text-xs text-muted-foreground">119904100228</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 md:px-8 py-8">
        <div className="mb-8">
          {activeSection !== "overview" ? (
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveSection("overview")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                  {activeItem && (
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${activeItem.color}`}>
                      <activeItem.icon className="h-5 w-5" />
                    </div>
                  )}
                  {activeItem?.title}
                </h2>
                <p className="text-muted-foreground mt-1">{activeItem?.description}</p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Admin Control Panel
              </h2>
              <p className="text-muted-foreground mt-1">
                Manage all campus reservations and user accounts
              </p>
            </>
          )}
        </div>

        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
