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
  ORG_FName: string;
  ORG_MiddleI?: string;
  ORG_LName: string;
  ORG_Organization: string;
}

const API_BASE_URL = "http://localhost:5256/api/organizers";

export function OrganizerManagement() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [editOrganizer, setEditOrganizer] = useState<Organizer | null>(null);
  const [deleteOrganizer, setDeleteOrganizer] = useState<Organizer | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [formData, setFormData] = useState<Omit<Organizer, 'id'>>({
    ORG_FName: "",
    ORG_MiddleI: "",
    ORG_LName: "",
    ORG_Organization: "",
  });

  // Load organizers from API
  useEffect(() => {
    const loadOrganizers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Expected array but got ' + typeof data);
        }
        
        const mappedOrganizers: Organizer[] = data.map((org: any) => ({
          id: org.org_Id,
          ORG_FName: org.org_FName || 'Unknown',
          ORG_MiddleI: org.org_MiddleI || '',
          ORG_LName: org.org_LName || 'Unknown',
          ORG_Organization: org.org_Organization || 'Unknown Organization'
        }));

        setOrganizers(mappedOrganizers);
      } catch (error) {
        console.error('Error loading organizers:', error);
        toast({
          title: "Error",
          description: `Failed to load organizers: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOrganizers();
  }, []);

  const resetForm = () => {
    setFormData({
      ORG_FName: "",
      ORG_MiddleI: "",
      ORG_LName: "",
      ORG_Organization: "",
    });
    setEditOrganizer(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.ORG_FName || !formData.ORG_LName || !formData.ORG_Organization) {
    toast({ 
      title: "Error", 
      description: "Please fill in all required fields.", 
      variant: "destructive" 
    });
    return;
  }

  try {
    const url = editOrganizer 
      ? `${API_BASE_URL}/${editOrganizer.id}`
      : API_BASE_URL;
    
    const method = editOrganizer ? 'PUT' : 'POST';

    
    const requestBody = {
      ORG_FName: formData.ORG_FName,
      ORG_MiddleI: formData.ORG_MiddleI || null,
      ORG_LName: formData.ORG_LName,
      ORG_Organization: formData.ORG_Organization
    };

    const response = await fetch(url, {
      method,
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (editOrganizer) {
      setOrganizers(orgs => 
        orgs.map(org => 
          org.id === editOrganizer.id 
            ? { 
                ...org, // Keep existing properties
                ORG_FName: formData.ORG_FName,
                ORG_MiddleI: formData.ORG_MiddleI,
                ORG_LName: formData.ORG_LName,
                ORG_Organization: formData.ORG_Organization
              } 
            : org
        )
      );
      toast({
        title: "Success",
        description: "Organizer updated successfully!",
      });
    } else {
      const newOrganizer: Organizer = {
        id: data.org_Id || data.ORG_Id, // Handle both cases
        ...formData
      };
      setOrganizers(orgs => [...orgs, newOrganizer]);
      toast({
        title: "Success",
        description: "Organizer added successfully!",
      });
    }

    setShowAddDialog(false);
    resetForm();
  } catch (error) {
    console.error('Error saving organizer:', error);
    toast({
      title: "Error",
      description: `Failed to save organizer: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive",
    });
  }
};

  const handleEdit = (organizer: Organizer) => {
    setFormData({
      ORG_FName: organizer.ORG_FName,
      ORG_MiddleI: organizer.ORG_MiddleI || '',
      ORG_LName: organizer.ORG_LName,
      ORG_Organization: organizer.ORG_Organization,
    });
    setEditOrganizer(organizer);
    setShowAddDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteOrganizer) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${deleteOrganizer.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setOrganizers(orgs => orgs.filter(org => org.id !== deleteOrganizer.id));
      setDeleteOrganizer(null);
      
      toast({
        title: "Success",
        description: "Organizer deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting organizer:', error);
      toast({
        title: "Error",
        description: `Failed to delete organizer: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Organizer Management</h1>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Organizer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organizers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading organizers...</div>
          ) : organizers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No organizers found. Add your first organizer to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizers.map((organizer) => (
                  <TableRow key={organizer.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        {organizer.ORG_Organization}
                      </div>
                    </TableCell>
                    <TableCell>
                      {`${organizer.ORG_FName} ${
                        organizer.ORG_MiddleI ? organizer.ORG_MiddleI + ' ' : ''
                      }${organizer.ORG_LName}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(organizer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteOrganizer(organizer)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          resetForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editOrganizer ? 'Edit Organizer' : 'Add New Organizer'}
            </DialogTitle>
            <DialogDescription>
              {editOrganizer 
                ? 'Update the organizer details below.'
                : 'Fill in the details of the new organizer.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ORG_FName">First Name *</Label>
                <Input
                  id="ORG_FName"
                  name="ORG_FName"
                  value={formData.ORG_FName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ORG_MiddleI">Middle Initial</Label>
                <Input
                  id="ORG_MiddleI"
                  name="ORG_MiddleI"
                  value={formData.ORG_MiddleI}
                  onChange={handleInputChange}
                  maxLength={1}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ORG_LName">Last Name *</Label>
              <Input
                id="ORG_LName"
                name="ORG_LName"
                value={formData.ORG_LName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ORG_Organization">Organization Name *</Label>
              <Input
                id="ORG_Organization"
                name="ORG_Organization"
                value={formData.ORG_Organization}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editOrganizer ? 'Update' : 'Add'} Organizer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteOrganizer}
        onOpenChange={(open) => !open && setDeleteOrganizer(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the organizer and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}