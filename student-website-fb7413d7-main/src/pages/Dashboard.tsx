import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  CalendarPlus, 
  Lock, 
  Bell, 
  ChevronDown, 
  LogOut,
  Plus,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ParkingReservationForm } from "@/components/forms/ParkingReservationForm";
import { ActivityRequestForm } from "@/components/forms/ActivityRequestForm";
import { LockerReservationForm } from "@/components/forms/LockerReservationForm";
import { toast } from "@/hooks/use-toast";

type DialogType = "parking" | "activity" | "locker" | null;
type ParkingStatus = 'loading' | 'hasParking' | 'noParking' | 'error';

const Dashboard = () => {
  const navigate = useNavigate();
  const [parkingStatus, setParkingStatus] = useState<ParkingStatus>('loading');
  const [openDialog, setOpenDialog] = useState<DialogType>(null);
  const [studentName, setStudentName] = useState("Student Dashboard");
  const [studentInitials, setStudentInitials] = useState("ST");
  const [studentId, setStudentId] = useState<string | null>(null);

  // Check parking status for a student
  const checkParkingStatus = useCallback(async (id: string): Promise<void> => {
    console.log(`[Parking Debug] Checking parking status for student ID: ${id}`);
    setParkingStatus('loading');
    
    try {
      const response = await fetch(
        `http://localhost:5256/api/parking/check-parking-by-student-id/${id}`
      );
      
      console.log('[Parking Debug] Parking status response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const hasActiveParking = await response.json();
      setParkingStatus(hasActiveParking ? 'hasParking' : 'noParking');
      
    } catch (error) {
      console.error('[Parking Debug] Error checking parking status:', error);
      setParkingStatus('error');
    }
  }, []);

  // Fetch user data and parking status
  useEffect(() => {
    console.log('[Dashboard] Initializing dashboard...');
    const stored = localStorage.getItem("registeredUser");
    
    if (!stored) {
      console.warn('[Dashboard] No registered user found in localStorage');
      setParkingStatus('error');
      return;
    }

    try {
      console.log('[Dashboard] Parsing user data from localStorage');
      const parsed = JSON.parse(stored) as {
        studFirstName?: string;
        studMiddleInitial?: string;
        studLastName?: string;
        studId?: string;
      };

      console.log('[Dashboard] Parsed user data:', parsed);

      // Set user info
      const first = parsed.studFirstName?.trim() ?? "";
      const middle = parsed.studMiddleInitial?.trim() ?? "";
      const last = parsed.studLastName?.trim() ?? "";

      if (first || last) {
        const fullName = [first, middle && `${middle}.`, last].filter(Boolean).join(" ");
        const initials = (first ? first[0].toUpperCase() : "") + (last ? last[0].toUpperCase() : "");
        
        console.log(`[Dashboard] Setting user name to: ${fullName}, initials: ${initials}`);
        setStudentName(fullName);
        setStudentInitials(initials);
      }

      // Set student ID if available
      if (parsed.studId) {
        console.log(`[Dashboard] Found student ID: ${parsed.studId}`);
        setStudentId(parsed.studId);
        checkParkingStatus(parsed.studId).catch(error => {
          console.error('[Dashboard] Error in checkParkingStatus:', error);
        });
      } else {
        console.warn('[Dashboard] No student ID found in user data');
        setParkingStatus('error');
      }
    } catch (error) {
      console.error('[Dashboard] Error initializing dashboard:', error);
      setParkingStatus('error');
    }
  }, [checkParkingStatus]);

  const handleLogout = () => {
    localStorage.removeItem("registeredUser");
    navigate("/");
  };

  const closeDialog = () => setOpenDialog(null);

  const handleLockerClick = async () => {
    if (!studentId) {
      toast({
        title: "Error",
        description: "Student information not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    // Re-check parking status right before opening the locker dialog
    await checkParkingStatus(studentId);

    if (parkingStatus === 'hasParking') {
      setOpenDialog("locker");
    } else {
      toast({
        title: "Parking Reservation Required",
        description: "You need an active parking reservation to access lockers.",
        variant: "destructive",
      });
    }
  };

  const handleParkingSuccess = async () => {
    await refreshParkingStatus();
  };

  const refreshParkingStatus = useCallback(async () => {
    if (studentId) {
      await checkParkingStatus(studentId);
    }
  }, [studentId, checkParkingStatus]);

  const menuItems = [
    {
      title: "Parking Reservation",
      description: "Reserve your parking spot on campus",
      icon: Car,
      actions: [
        { 
          label: "Create Reservation", 
          icon: Plus, 
          onClick: () => setOpenDialog("parking") 
        }
      ],
    },
    {
      title: "Activity Request Form",
      description: "Submit requests for campus activities and events",
      icon: CalendarPlus,
      actions: [
        { 
          label: "Create Request", 
          icon: Plus, 
          onClick: () => setOpenDialog("activity") 
        },
      ],
    },
    {
      title: "Locker Reservation",
      description: parkingStatus === 'loading' 
        ? "Checking parking status..." 
        : parkingStatus === 'hasParking' 
          ? "Reserve a locker for your belongings" 
          : "Requires active parking reservation",
      icon: Lock,
      actions: [
        { 
          label: "Create Reservation", 
          icon: Plus, 
          onClick: handleLockerClick,
          disabled: parkingStatus === 'loading' || parkingStatus === 'noParking'
        }
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SR</span>
            </div>
            <h1 className="text-lg font-semibold text-foreground hidden sm:block">
              Student Request Forms
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-medium text-accent-foreground flex items-center justify-center">
                3
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 md:px-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium text-sm">
                      {studentInitials}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-foreground">
                    {studentName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  {studentName}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-destructive focus:text-destructive"
                >
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
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back!
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your campus reservations and requests
          </p>
        </div>

        {/* Menu Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <Card 
              key={item.title}
              className="transition-all duration-200 hover:shadow-lg hover:border-primary/30"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-lg mt-3">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {item.actions.map((action) => (
                    <Button
                      key={action.label}
                      variant="default"
                      size="sm"
                      onClick={action.onClick}
                      className="flex items-center gap-1.5"
                      disabled={action.disabled}
                    >
                      <action.icon className="h-4 w-4" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Parking Dialog */}
        <Dialog open={openDialog === "parking"} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Parking Reservation</DialogTitle>
              <DialogDescription>
                Fill out the form to reserve your parking spot.
              </DialogDescription>
            </DialogHeader>
            <ParkingReservationForm 
              onClose={closeDialog} 
              onSuccess={handleParkingSuccess} 
            />
          </DialogContent>
        </Dialog>

        {/* Activity Dialog */}
        <Dialog open={openDialog === "activity"} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Activity Request</DialogTitle>
              <DialogDescription>
                Submit your activity request for admin approval.
              </DialogDescription>
            </DialogHeader>
            <ActivityRequestForm onClose={closeDialog} />
          </DialogContent>
        </Dialog>

        {/* Locker Dialog */}
        <Dialog open={openDialog === "locker"} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Locker Reservation</DialogTitle>
              <DialogDescription>
                Select a locker spot to reserve.
              </DialogDescription>
            </DialogHeader>
            <LockerReservationForm onClose={closeDialog} />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Dashboard;