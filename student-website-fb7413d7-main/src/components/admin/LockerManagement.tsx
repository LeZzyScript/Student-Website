import { useState } from "react";
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
import { Lock, User, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LockerSpot {
  id: string;
  occupied: boolean;
  student?: {
    studId: string;
    name: string;
    course: string;
  };
}

// Generate A1-E9 locker grid (same as parking)
const generateLockerGrid = (): LockerSpot[] => {
  const rows = ["A", "B", "C", "D", "E"];
  const spots: LockerSpot[] = [];
  
  rows.forEach((row) => {
    for (let i = 1; i <= 9; i++) {
      const id = `${row}${i}`;
      // Some mock occupied spots
      const isOccupied = ["A2", "B4", "C1", "D6", "E3", "A8"].includes(id);
      spots.push({
        id,
        occupied: isOccupied,
        student: isOccupied ? {
          studId: `250${Math.floor(Math.random() * 9)}425`,
          name: ["Juan Dela Cruz", "Maria Santos", "Pedro Garcia", "Ana Reyes", "Jose Rizal"][Math.floor(Math.random() * 5)],
          course: ["BSIT", "BSN", "BSCRIM", "BSHM", "BSMT"][Math.floor(Math.random() * 5)],
        } : undefined,
      });
    }
  });
  
  return spots;
};

export function LockerManagement() {
  const [spots, setSpots] = useState<LockerSpot[]>(generateLockerGrid);
  const [selectedSpot, setSelectedSpot] = useState<LockerSpot | null>(null);
  const [removeSpot, setRemoveSpot] = useState<LockerSpot | null>(null);

  const handleSpotClick = (spot: LockerSpot) => {
    setSelectedSpot(spot);
  };

  const toggleOccupancy = (spotId: string) => {
    setSpots(spots.map((spot) => {
      if (spot.id === spotId) {
        const newOccupied = !spot.occupied;
        return {
          ...spot,
          occupied: newOccupied,
          student: newOccupied ? undefined : spot.student,
        };
      }
      return spot;
    }));
    setSelectedSpot(null);
    toast({
      title: "Locker Updated",
      description: `Locker ${spotId} has been updated. User will be notified.`,
    });
  };

  const handleRemoveOccupant = () => {
    if (!removeSpot) return;
    
    setSpots(spots.map((spot) => {
      if (spot.id === removeSpot.id) {
        return { ...spot, occupied: false, student: undefined };
      }
      return spot;
    }));
    
    toast({
      title: "Occupant Removed",
      description: `${removeSpot.student?.name} has been removed from locker ${removeSpot.id}. They will be notified.`,
    });
    setRemoveSpot(null);
    setSelectedSpot(null);
  };

  const rows = ["A", "B", "C", "D", "E"];
  const occupiedCount = spots.filter((s) => s.occupied).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Locker Grid (A1 - E9)
            </div>
            <div className="flex gap-4 text-sm font-normal">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500" />
                <span>Available ({45 - occupiedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-destructive/20 border border-destructive" />
                <span>Occupied ({occupiedCount})</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row} className="flex items-center gap-2">
                <span className="w-6 font-semibold text-muted-foreground">{row}</span>
                <div className="flex gap-2 flex-wrap">
                  {spots
                    .filter((spot) => spot.id.startsWith(row))
                    .map((spot) => (
                      <button
                        key={spot.id}
                        onClick={() => handleSpotClick(spot)}
                        className={`
                          w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center
                          transition-all duration-200 hover:scale-105 cursor-pointer
                          ${spot.occupied 
                            ? "bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20" 
                            : "bg-green-500/10 border-green-500 text-green-700 hover:bg-green-500/20"
                          }
                        `}
                      >
                        <span className="text-xs font-medium">{spot.id}</span>
                        {spot.occupied && <Lock className="h-4 w-4 mt-0.5" />}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spot Details Dialog */}
      <Dialog open={!!selectedSpot} onOpenChange={() => setSelectedSpot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Locker {selectedSpot?.id}
              <Badge variant={selectedSpot?.occupied ? "destructive" : "default"}>
                {selectedSpot?.occupied ? "Occupied" : "Available"}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedSpot?.occupied 
                ? "View occupant details or remove them from this locker." 
                : "This locker is currently available."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSpot?.occupied && selectedSpot.student && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedSpot.student.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSpot.student.studId} • {selectedSpot.student.course}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => toggleOccupancy(selectedSpot!.id)}
              className="flex-1"
            >
              Mark as {selectedSpot?.occupied ? "Available" : "Occupied"}
            </Button>
            {selectedSpot?.occupied && (
              <Button
                variant="destructive"
                onClick={() => setRemoveSpot(selectedSpot)}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Remove Occupant
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <AlertDialog open={!!removeSpot} onOpenChange={() => setRemoveSpot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Occupant?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {removeSpot?.student?.name} from locker {removeSpot?.id}. 
              They will receive a notification about this change.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveOccupant} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
