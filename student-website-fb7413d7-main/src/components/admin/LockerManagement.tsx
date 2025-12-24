import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Lock, User, X, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Locker {
  id: string;
  spotNumber: string;
  isAvailable: boolean;
  student?: {
    studId: string;
    name: string;
    course: string;
  };
  rentalStartDate?: string;
  rentalEndDate?: string;
}

// This function is no longer needed as we're fetching from the database

export function LockerManagement() {
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [removeLocker, setRemoveLocker] = useState<Locker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

    // Fetch lockers from the backend
  useEffect(() => {
    const fetchLockers = async () => {
      try {
        setIsLoading(true);
        
        // Fetch lockers from the backend
        const response = await fetch('http://localhost:5256/api/lockers', {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch lockers');
        }
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server');
        }
        
        // Map the API response to the Locker interface
        const mappedLockers = data.map((locker: any) => {
          const lockerId = locker.LOCK_Id ?? locker.lock_Id ?? locker.id;
          const spotNumber = locker.LOCK_Spot ?? locker.lock_Spot ?? locker.spotNumber;
          const isAvailable = locker.LOCK_IsAvailable ?? locker.lock_IsAvailable ?? locker.isAvailable;
          const student = locker.Student ?? locker.student;
  
        return {
          id: lockerId?.toString() || '',
          spotNumber: spotNumber || 'N/A',
          isAvailable: !!isAvailable,
          dateCreated: locker.LOCK_DateCreated ?? locker.lock_DateCreated,
          student: student ? {
          studId: student.STUD_StudentId ?? student.stud_StudentId ?? student.studentId ?? '',
          name: `${student.STUD_FirstName ?? student.stud_FirstName ?? ''} ${student.STUD_LastName ?? student.stud_LastName ?? ''}`.trim() || 'Unknown',
          course: student.STUD_Course ?? student.stud_Course ?? 'N/A'
          } :   undefined
        };
    });

    setLockers(mappedLockers);
    
    } catch (error) {
        console.error('Error fetching lockers:', error);
        toast({
          title: "Error",
          description: "Could not load locker data. Please try again later.",
          variant: "destructive"
        });
        setLockers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLockers();
  }, []);

  const handleLockerClick = (locker: Locker) => {
    setSelectedLocker(locker);
  };

  const handleRemoveOccupant = async () => {
    if (!removeLocker) return;

    try { 
      setLockers(prevLockers => 
        prevLockers.map(l => 
          l.id === removeLocker.id 
            ? { ...l, isAvailable: true, student: undefined, rentalStartDate: undefined, rentalEndDate: undefined }
            : l
        )
      );
      
      toast({
        title: "Success",
        description: `Locker ${removeLocker.id} has been released.`,
      });
    } catch (error) {
      console.error('Error releasing locker:', error);
      toast({
        title: "Error",
        description: "Failed to release locker.",
        variant: "destructive",
      });
    } finally {
      setRemoveLocker(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Locker Management
            </div>
            <div className="text-sm font-normal">
              Total: {lockers.length} | Available: {lockers.filter(l => l.isAvailable).length}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockers.map((locker) => (
              <div
                key={locker.id}
                onClick={() => handleLockerClick(locker)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  locker.isAvailable
                    ? "bg-green-50 hover:bg-green-100 border-green-200"
                    : "bg-red-50 hover:bg-red-100 border-red-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Locker {locker.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {locker.spotNumber} {!locker.isAvailable && "• Occupied"}
                    </p>
                  </div>
                  <Badge
                    variant={locker.isAvailable ? "default" : "destructive"}
                    className="ml-2"
                  >
                    {locker.isAvailable ? "Occupied" : "Available"}
                  </Badge>
                </div>
                {!locker.isAvailable && locker.student && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      <span>{locker.student.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      ID: {locker.student.studId} • {locker.student.course}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Rental: {locker.rentalStartDate} to {locker.rentalEndDate}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Locker Details Dialog */}
      <Dialog
        open={!!selectedLocker}
        onOpenChange={(open) => !open && setSelectedLocker(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Locker {selectedLocker?.id}</DialogTitle>
            <DialogDescription>
              {selectedLocker?.isAvailable
                ? "This locker is currently available."
                : "Locker rental details."}
            </DialogDescription>
          </DialogHeader>
          {selectedLocker && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p>
                    {selectedLocker.isAvailable ? (
                      <Badge>Occupied</Badge>
                    ) : (
                      <Badge variant="destructive">Available</Badge>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Spot Number</p>
                  <p>{selectedLocker.spotNumber}</p>
                </div>
              </div>

              {!selectedLocker.isAvailable && selectedLocker.student && (
                <div className="space-y-2">
                  <h4 className="font-medium">Rented By</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-medium">{selectedLocker.student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedLocker.student.studId} • {selectedLocker.student.course}
                    </p>
                    <div className="mt-2 text-sm">
                      <p>Rental Period:</p>
                      <p>
                        {selectedLocker.rentalStartDate} to {selectedLocker.rentalEndDate}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedLocker(null)}
                >
                  Close
                </Button>
                {!selectedLocker.isAvailable && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setRemoveLocker(selectedLocker);
                      setSelectedLocker(null);
                    }}
                  >
                    Release Locker
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Release Dialog */}
      <AlertDialog
        open={!!removeLocker}
        onOpenChange={(open) => !open && setRemoveLocker(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release Locker {removeLocker?.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the locker as available. The current occupant will no longer have access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveOccupant}>
              Confirm Release
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}