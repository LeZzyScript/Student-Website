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
import { Car, User, X, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface ParkingSpot {
  id: string;
  occupied: boolean;
  student?: {
    studId: string;
    name: string;
    course: string;
  };
  vehicleType?: string;
  vehicleModel?: string;
  schedule?: string;
  reservationDate?: string;  
  expiryDate?: string;
}

// Generate A1-E9 parking grid with all spots initially available
const generateEmptyParkingGrid = (): ParkingSpot[] => {
  const rows = ["A", "B", "C", "D", "E"];
  const spots: ParkingSpot[] = [];
  
  rows.forEach((row) => {
    for (let i = 1; i <= 9; i++) {
      spots.push({
        id: `${row}${i}`,
        occupied: false
      });
    }
  });
  
  return spots;
};

export function ParkingManagement() {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [removeSpot, setRemoveSpot] = useState<ParkingSpot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch parking spots from the backend
  useEffect(() => {
const fetchParkingSpots = async () => {
  try {
    setIsLoading(true);
    const response = await fetch('http://localhost:5256/api/parking/spots');
    const data = await response.json();
    console.log('Parking spots response:', data);
    if (!response.ok) {
      throw new Error('Failed to fetch parking spots');
    }    
    if (Array.isArray(data)) {
      // Map the data to include the new date fields
      const mappedData = data.map((spot: any) => ({
        id: spot.park_Spot,
        occupied: !spot.park_IsAvailable,
        student: spot.student ? {
          studId: spot.student.stud_StudentId,
          name: `${spot.student.stud_FirstName} ${spot.student.stud_LastName}`,
          course: spot.student.stud_Course
        } : undefined,
        vehicleType: spot.park_VehicleType,
        vehicleModel: spot.park_VehicleModel,
        schedule: spot.park_Schedule,
        reservationDate: spot.park_ReservationDate,
        expiryDate: spot.park_ExpiryDate
      }));
      setSpots(mappedData);
    } else {
      // If no data, initialize with empty grid
      setSpots(generateEmptyParkingGrid());
    }
  } catch (error) {
    console.error('Error fetching parking spots:', error);
    toast({
      title: "Error",
      description: "Failed to load parking spots. Using local data.",
      variant: "destructive",
    });
    // Fallback to empty grid if API fails
    setSpots(generateEmptyParkingGrid());
  } finally {
    setIsLoading(false);
  }
};

    fetchParkingSpots();
  }, []);

  const handleSpotClick = (spot: ParkingSpot) => {
    setSelectedSpot(spot);
  };

  const toggleOccupancy = async (spotId: string) => {
    try {
      const spotToUpdate = spots.find(spot => spot.id === spotId);
      if (!spotToUpdate) {
        throw new Error('Spot not found');
      }

      const updatedSpot: ParkingSpot = {
        ...spotToUpdate,
        occupied: !spotToUpdate.occupied,
        student: !spotToUpdate.occupied ? spotToUpdate.student : undefined,
        vehicleType: !spotToUpdate.occupied ? spotToUpdate.vehicleType : undefined,
        vehicleModel: !spotToUpdate.occupied ? spotToUpdate.vehicleModel : undefined,
        schedule: !spotToUpdate.occupied ? spotToUpdate.schedule : undefined,
        reservationDate: !spotToUpdate.occupied ? spotToUpdate.reservationDate : undefined,
        expiryDate: !spotToUpdate.occupied ? spotToUpdate.expiryDate : undefined,
      };

      // Update backend
      const response = await fetch(`http://localhost:5256/api/parking/spots/${encodeURIComponent(spotId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSpot)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update parking spot');
      }

      // Update local state
      setSpots(prevSpots => 
        prevSpots.map(spot => 
          spot.id === spotId ? {
            ...spot,
            ...updatedSpot
          } : spot
        )
      );
      
      setSelectedSpot(null);
      toast({
        title: "Success",
        description: `Parking spot ${spotId} has been marked as ${updatedSpot.occupied ? 'occupied' : 'available'}.`,
      });
    } catch (error) {
      console.error('Error updating parking spot:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update parking spot',
        variant: "destructive",
      });
    }
  };

  const handleRemoveOccupant = async () => {
    if (!removeSpot) return;
    
    try {
      // Update backend
      const response = await fetch(`http://localhost:5256/api/parking/spots/${encodeURIComponent(removeSpot.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...removeSpot,
          occupied: false,
          student: undefined,
          vehicleType: undefined,
          vehicleModel: undefined,
          schedule: undefined,
          reservationDate: undefined,
          expiryDate: undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to remove occupant');
      }

      // Update local state
      setSpots(prevSpots => 
        prevSpots.map(spot => 
          spot.id === removeSpot.id 
            ? { 
                ...spot, 
                occupied: false, 
                student: undefined, 
                vehicleType: undefined, 
                vehicleModel: undefined, 
                schedule: undefined,
                reservationDate: undefined,
                expiryDate: undefined
              }
            : spot
        )
      );
      
      toast({
        title: "Success",
        description: `Occupant has been removed from spot ${removeSpot.id}.`,
      });
    } catch (error) {
      console.error('Error removing occupant:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to remove occupant',
        variant: "destructive",
      });
    } finally {
      setRemoveSpot(null);
    }
  };

  const rows = ["A", "B", "C", "D", "E"];
  const occupiedCount = spots.filter((s) => s.occupied).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Parking Grid (A1 - E9)
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
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading parking spots...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
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
                          {spot.occupied && <Car className="h-4 w-4 mt-0.5" />}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spot Details Dialog */}
      {selectedSpot && (
  <Dialog open={!!selectedSpot} onOpenChange={() => setSelectedSpot(null)}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Parking Spot {selectedSpot.id}</DialogTitle>
        <DialogDescription>
          {selectedSpot.occupied ? 'Occupied' : 'Available'} parking spot
        </DialogDescription>
      </DialogHeader>
      
      {selectedSpot.occupied && selectedSpot.student && (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Occupied by:</h4>
            <p>{selectedSpot.student.name}</p>
            <p className="text-sm text-muted-foreground">
              {selectedSpot.student.studId} • {selectedSpot.student.course}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">Vehicle:</h4>
            <p>{selectedSpot.vehicleType} • {selectedSpot.vehicleModel}</p>
          </div>
          
          <div>
            <h4 className="font-medium">Schedule:</h4>
            <p>{selectedSpot.schedule}</p>
          </div>
          
          {selectedSpot.reservationDate && (
            <div>
              <h4 className="font-medium">Reservation Date:</h4>
              <p>{new Date(selectedSpot.reservationDate).toLocaleDateString()}</p>
            </div>
          )}
          
          {selectedSpot.expiryDate && (
            <div>
              <h4 className="font-medium">Expiry Date:</h4>
              <p>{new Date(selectedSpot.expiryDate).toLocaleDateString()}</p>
            </div>
          )}
          
          <Button 
            variant="destructive" 
            onClick={() => {
              setRemoveSpot(selectedSpot);
              setSelectedSpot(null);
            }}
          >
            <X className="h-4 w-4 mr-2" /> Remove Occupant
          </Button>
        </div>
      )}
      
      {!selectedSpot.occupied && (
        <p>This parking spot is currently available.</p>
      )}
    </DialogContent>
  </Dialog>
)}

      {/* Remove Confirmation */}
      <AlertDialog open={!!removeSpot} onOpenChange={() => setRemoveSpot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Occupant?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {removeSpot?.student?.name} from parking spot {removeSpot?.id}. 
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
