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

export function LockerReservationForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState<LockerFormData>({
    spot: "",
  });

  const spots = generateSpots();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.spot) {
      toast({
        title: "Error",
        description: "Please select a locker spot.",
        variant: "destructive",
      });
      return;
    }

    // Simulate submission
    console.log("Locker Reservation:", {
      ...formData,
      dateCreated: new Date().toISOString(),
      isAvailable: false,
    });

    toast({
      title: "Success",
      description: "Locker reservation submitted successfully!",
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="lockerSpot">Locker Spot *</Label>
        <Select
          value={formData.spot}
          onValueChange={(value) => setFormData({ ...formData, spot: value })}
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
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          Reserve Locker
        </Button>
      </div>
    </form>
  );
}
