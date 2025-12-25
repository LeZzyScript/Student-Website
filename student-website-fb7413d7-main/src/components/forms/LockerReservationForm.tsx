import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface LockerFormData {
  spot: string;
}

interface LockerReservationResponse {
  success: boolean;
  message: string;
  data?: {
    LOCK_Id: number;
    LOCK_Spot: string;
    studentId: string;
  };
}

interface StudentInfo {
  STUD_Id: number;
  STUD_StudentId: string;
  STUD_FName: string;
  STUD_LName: string;
  STUD_Course: string;
}

const generateSpots = () => {
  const rows = ["A", "B", "C", "D", "E"];
  const spots: string[] = [];
  rows.forEach((row) => {
    for (let i = 1; i <= 9; i++) {
      spots.push(`${row}${i}`);
    }
  });
  return spots;
};

interface LockerReservationFormProps {
  onClose: () => void;
}

export function LockerReservationForm({ onClose }: LockerReservationFormProps) {
  const [formData, setFormData] = useState<LockerFormData>({ spot: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const spots = generateSpots();

  const getStudentInfo = async (studentId: string): Promise<StudentInfo> => {
  try {
    // Try the correct endpoint based on your API
    const response = await fetch(`http://localhost:5256/api/students?studentId=${studentId}`);
    
    if (!response.ok) {
      // If 404, try an alternative endpoint
      if (response.status === 404) {
        const altResponse = await fetch(`http://localhost:5256/api/students/find?studentId=${studentId}`);
        if (!altResponse.ok) {
          throw new Error(`Student not found (${altResponse.status})`);
        }
        return await altResponse.json();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching student info:", error);
    throw new Error("Failed to fetch student information. Please try again later.");
  }
};

  const checkParkingStatus = async (studentId: string): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:5256/api/parking/check-parking-by-student-id/${studentId}`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to check parking status: ${error || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking parking status:", error);
    throw error; // Re-throw to be handled by the caller
  }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!formData.spot) {
        throw new Error("Please select a locker spot.");
      }

      // Get student ID from localStorage
      const stored = localStorage.getItem("registeredUser");
      if (!stored) throw new Error("Not registered. Please register first.");
      
      const parsed = JSON.parse(stored) as { studId?: string };
      const studentId = parsed.studId;
      if (!studentId) throw new Error("Invalid student data. Please register again.");

      // Check parking status using the student ID
      const hasParking = await checkParkingStatus(studentId);
      
      if (!hasParking) {
        throw new Error("You must have an active parking reservation to reserve a locker.");
      }

      // Proceed with locker reservation
      const response = await fetch("http://localhost:5256/api/lockers/reserve", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          StudId: studentId,
          Spot: formData.spot.trim().toUpperCase(),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: result.message || "Locker reserved successfully!",
      });
      
      onClose();

    } catch (error) {
      console.error("Locker reservation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process your request. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="lockerSpot">Locker Spot *</Label>
        <Select
          value={formData.spot}
          onValueChange={(value) => setFormData({ ...formData, spot: value })}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a locker spot" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {spots.map((spot) => (
              <SelectItem key={spot} value={spot}>
                Locker {spot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose} 
          className="flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={!formData.spot || isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Reserve Locker"}
        </Button>
      </div>
    </form>
  );
}