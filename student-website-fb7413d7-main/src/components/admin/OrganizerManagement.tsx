import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Building2, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Organizer {
  id: number;
  firstName: string;
  middleInitial: string;
  lastName: string;
  organization: string;
}

export function OrganizerManagement() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editOrganizer, setEditOrganizer] = useState<Organizer | null>(null);
  const [deleteOrganizer, setDeleteOrganizer] = useState<Organizer | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    middleInitial: "",
    lastName: "",
    organization: "",
  });

  useEffect(() => {
    const loadOrganizers = async () => {
      try {
        const res = await fetch("http://localhost:5256/api/organizers");
        if (!res.ok) return;
        const data = await res.json();
        const mapped: Organizer[] = data.map((o: any) => ({
          id: o.org_Id,
          firstName: o.org_FName,
          middleInitial: o.org_MiddleI ?? "",
          lastName: o.org_LName,
          organization: o.org_Organization,
        }));
        setOrganizers(mapped);
      } catch {
        // ignore
      }
    };
    loadOrganizers();
  }, []);

  const resetForm = () => {
    setFormData({ firstName: "", middleInitial: "", lastName: "", organization: "" });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.organization) {
      toast({ title: "Error", description: "Please fill in required fields.", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch("http://localhost:5256/api/organizers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          middleInitial: formData.middleInitial,
          lastName: formData.lastName,
          organization: formData.organization,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        toast({ title: "Error", description: text || "Failed to add organizer.", variant: "destructive" });
        return;
      }
      const data = await res.json();
      const newOrganizer: Organizer = {
        id: data.org_Id,
        firstName: data.org_FName,
        middleInitial: data.org_MiddleI ?? "",
        lastName: data.org_LName,
        organization: data.org_Organization,
      };
      setOrganizers([...organizers, newOrganizer]);
      resetForm();
      setShowAddDialog(false);
      toast({
        title: "Organizer Added",
        description: `${newOrganizer.firstName} ${newOrganizer.lastName} has been added. Activity forms will be updated.`,
      });
    } catch {
      toast({ title: "Error", description: "Unable to contact server.", variant: "destructive" });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrganizer || !formData.firstName || !formData.lastName || !formData.organization) {
      toast({ title: "Error", description: "Please fill in required fields.", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch(`http://localhost:5256/api/organizers/${editOrganizer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          middleInitial: formData.middleInitial,
          lastName: formData.lastName,
          organization: formData.organization,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        toast({ title: "Error", description: text || "Failed to update organizer.", variant: "destructive" });
        return;
      }
      const data = await res.json();
      const updated: Organizer = {
        id: data.org_Id,
        firstName: data.org_FName,
        middleInitial: data.org_MiddleI ?? "",
        lastName: data.org_LName,
        organization: data.org_Organization,
      };
      setOrganizers(organizers.map((o) => (o.id === updated.id ? updated : o)));
      resetForm();
      setEditOrganizer(null);
      toast({
        title: "Organizer Updated",
        description: "The organizer has been updated. Activity forms will reflect this change.",
      });
    } catch {
      toast({ title: "Error", description: "Unable to contact server.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteOrganizer) return;
    try {
      const res = await fetch(`http://localhost:5256/api/organizers/${deleteOrganizer.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const text = await res.text();
        toast({ title: "Error", description: text || "Failed to delete organizer.", variant: "destructive" });
        return;
      }
      setOrganizers(organizers.filter((o) => o.id !== deleteOrganizer.id));
      toast({
        title: "Organizer Removed",
        description: `${deleteOrganizer.firstName} ${deleteOrganizer.lastName} has been removed. Activity forms will be updated.`,
      });
      setDeleteOrganizer(null);
    } catch {
      toast({ title: "Error", description: "Unable to contact server.", variant: "destructive" });
    }
  };

  const openEditDialog = (organizer: Organizer) => {
    setFormData({
      firstName: organizer.firstName,
      middleInitial: organizer.middleInitial,
      lastName: organizer.lastName,
      organization: organizer.organization,
    });
    setEditOrganizer(organizer);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Available Organizers ({organizers.length})
          </CardTitle>
          <Button onClick={() => setShowAddDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Organizer
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizers.map((organizer) => (
                <TableRow key={organizer.id}>
                  <TableCell className="font-medium">{organizer.id}</TableCell>
                  <TableCell>
                    {organizer.firstName} {organizer.middleInitial && `${organizer.middleInitial}. `}{organizer.lastName}
                  </TableCell>
                  <TableCell>{organizer.organization}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(organizer)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteOrganizer(organizer)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Organizer</DialogTitle>
            <DialogDescription>Add a new organizer to the system. They will appear in activity request forms.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleInitial">M.I.</Label>
                <Input id="middleInitial" maxLength={1} value={formData.middleInitial} onChange={(e) => setFormData({ ...formData, middleInitial: e.target.value.toUpperCase() })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization *</Label>
              <Input id="organization" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} placeholder="e.g., Student Council" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1">Add Organizer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editOrganizer} onOpenChange={(open) => { if (!open) { setEditOrganizer(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organizer</DialogTitle>
            <DialogDescription>Update organizer information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name *</Label>
                <Input id="editFirstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMiddleInitial">M.I.</Label>
                <Input id="editMiddleInitial" maxLength={1} value={formData.middleInitial} onChange={(e) => setFormData({ ...formData, middleInitial: e.target.value.toUpperCase() })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name *</Label>
                <Input id="editLastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editOrganization">Organization *</Label>
              <Input id="editOrganization" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setEditOrganizer(null); resetForm(); }} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteOrganizer} onOpenChange={() => setDeleteOrganizer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Organizer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {deleteOrganizer?.firstName} {deleteOrganizer?.lastName} from {deleteOrganizer?.organization}. 
              They will no longer appear in activity request forms.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
