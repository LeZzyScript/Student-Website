import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

interface ActivityFormData {
  organizerIds: string[];
  activityName: string;
  description: string;
}

// Mock organizers data - replace with actual data from Organizers table
const mockOrganizers = [
  { id: "1", name: "Student Council" },
  { id: "2", name: "Computer Science Club" },
  { id: "3", name: "Sports Committee" },
  { id: "4", name: "Arts and Culture Club" },
  { id: "5", name: "Environmental Society" },
  { id: "6", name: "Debate Club" },
  { id: "7", name: "Music Club" },
  { id: "8", name: "Photography Club" },
];

export function ActivityRequestForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState<ActivityFormData>({
    organizerIds: [],
    activityName: "",
    description: "",
  });

  const handleOrganizerToggle = (organizerId: string) => {
    setFormData((prev) => ({
      ...prev,
      organizerIds: prev.organizerIds.includes(organizerId)
        ? prev.organizerIds.filter((id) => id !== organizerId)
        : [...prev.organizerIds, organizerId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.organizerIds.length === 0 || !formData.activityName || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Simulate submission
    console.log("Activity Request:", {
      ...formData,
      isGranted: false,
    });

    toast({
      title: "Success",
      description: "Activity request submitted successfully! Awaiting admin approval.",
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Select Organizer(s) *</Label>
        <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg bg-muted/30 max-h-48 overflow-y-auto">
          {mockOrganizers.map((org) => (
            <div key={org.id} className="flex items-center space-x-2">
              <Checkbox
                id={`org-${org.id}`}
                checked={formData.organizerIds.includes(org.id)}
                onCheckedChange={() => handleOrganizerToggle(org.id)}
              />
              <Label
                htmlFor={`org-${org.id}`}
                className="font-normal cursor-pointer text-sm"
              >
                {org.name}
              </Label>
            </div>
          ))}
        </div>
        {formData.organizerIds.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {formData.organizerIds.length} organizer(s) selected
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="activityName">Activity Name *</Label>
        <Input
          id="activityName"
          placeholder="e.g., Annual Sports Festival"
          value={formData.activityName}
          onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Activity Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe the activity, its purpose, expected participants, etc."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          Submit Request
        </Button>
      </div>
    </form>
  );
}
