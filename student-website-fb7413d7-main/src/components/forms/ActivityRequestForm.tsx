import { useEffect, useState } from "react";
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

interface OrganizerOption {
  id: number;
  name: string;
}

export function ActivityRequestForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState<ActivityFormData>({
    organizerIds: [],
    activityName: "",
    description: "",
  });
  const [organizers, setOrganizers] = useState<OrganizerOption[]>([]);

  useEffect(() => {
    const loadOrganizers = async () => {
      try {
        const res = await fetch("http://localhost:5256/api/organizers");
        if (!res.ok) return;
        const data = await res.json();
        const mapped: OrganizerOption[] = data.map((o: any) => ({
          id: o.org_Id,
          name: o.org_Organization,
        }));
        setOrganizers(mapped);
      } catch {
        // ignore, form will just show empty list
      }
    };
    loadOrganizers();
  }, []);

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

    const stored = localStorage.getItem("registeredUser");
    if (!stored) {
      toast({
        title: "Not registered",
        description: "Please register first before requesting an activity.",
        variant: "destructive",
      });
      return;
    }

    const parsed = JSON.parse(stored) as { studId?: string };
    if (!parsed.studId) {
      toast({
        title: "Error",
        description: "Student ID not found. Please register again.",
        variant: "destructive",
      });
      return;
    }

    const firstOrganizerId = formData.organizerIds[0];

    (async () => {
      try {
        const response = await fetch("http://localhost:5256/api/activities/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studStudentId: parsed.studId,
            organizerId: Number(firstOrganizerId),
            activityName: formData.activityName,
            description: formData.description,
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          toast({
            title: "Error",
            description: text || "Failed to submit activity request.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Activity request submitted successfully! Awaiting admin approval.",
        });
        onClose();
      } catch {
        toast({
          title: "Error",
          description: "Unable to contact server. Please try again.",
          variant: "destructive",
        });
      }
    })();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Select Organizer(s) *</Label>
        <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg bg-muted/30 max-h-48 overflow-y-auto">
          {organizers.map((org) => (
            <div key={org.id} className="flex items-center space-x-2">
              <Checkbox
                id={`org-${org.id}`}
                checked={formData.organizerIds.includes(String(org.id))}
                onCheckedChange={() => handleOrganizerToggle(String(org.id))}
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
