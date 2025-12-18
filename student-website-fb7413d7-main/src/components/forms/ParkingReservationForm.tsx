import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";

interface ParkingFormData {
  spot: string;
  vehicleType: string;
  vehicleModel: string;
  schedule: string;
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

interface ParkingReservationFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function ParkingReservationForm({ onClose, onSuccess }: ParkingReservationFormProps) {
  const [formData, setFormData] = useState<ParkingFormData>({
    spot: "",
    vehicleType: "",
    vehicleModel: "",
    schedule: "",
  });

  const spots = generateSpots();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.spot || !formData.vehicleType || !formData.vehicleModel || !formData.schedule) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Simulate submission
    console.log("Parking Reservation:", {
      ...formData,
      dateCreated: new Date().toISOString(),
      isAvailable: false,
    });

    toast({
      title: "Success",
      description: "Parking reservation submitted successfully!",
    });
    onSuccess?.();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="spot">Parking Spot *</Label>
        <Select
          value={formData.spot}
          onValueChange={(value) => setFormData({ ...formData, spot: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a parking spot" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {spots.map((spot) => (
              <SelectItem key={spot} value={spot}>
                {spot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Vehicle Type *</Label>
        <RadioGroup
          value={formData.vehicleType}
          onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="motorcycle" id="motorcycle" />
            <Label htmlFor="motorcycle" className="font-normal cursor-pointer">
              Motorcycle
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="car" id="car" />
            <Label htmlFor="car" className="font-normal cursor-pointer">
              Car
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehicleModel">Vehicle Model *</Label>
        <Input
          id="vehicleModel"
          placeholder="e.g., Honda Civic, Yamaha NMAX"
          value={formData.vehicleModel}
          onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Schedule *</Label>
        <RadioGroup
          value={formData.schedule}
          onValueChange={(value) => setFormData({ ...formData, schedule: value })}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="am" id="am" />
            <Label htmlFor="am" className="font-normal cursor-pointer">
              AM (Morning)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pm" id="pm" />
            <Label htmlFor="pm" className="font-normal cursor-pointer">
              PM (Afternoon)
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          Submit Reservation
        </Button>
      </div>
    </form>
  );
}
