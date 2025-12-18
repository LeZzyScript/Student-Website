import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, Plus, Users, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Student {
  id: string;
  studId: string;
  yearLevel: number;
  course: string;
  accUserId: string;
}

interface Admin {
  id: string;
  accUserId: string;
  name: string;
}

// Mock data
const mockStudents: Student[] = [
  { id: "1", studId: "2501425", yearLevel: 1, course: "BSIT", accUserId: "12345678" },
  { id: "2", studId: "2502425", yearLevel: 2, course: "BSN", accUserId: "23456789" },
  { id: "3", studId: "2503425", yearLevel: 3, course: "BSCRIM", accUserId: "34567890" },
  { id: "4", studId: "2504425", yearLevel: 4, course: "BSHM", accUserId: "45678901" },
];

const mockAdmins: Admin[] = [
  { id: "1", accUserId: "119904100228", name: "System Administrator" },
];

export function UserManagement() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [admins, setAdmins] = useState<Admin[]>(mockAdmins);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "student" | "admin"; id: string } | null>(null);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ accUserId: "", name: "", password: "" });

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id));
    setDeleteTarget(null);
    toast({ title: "Student Deleted", description: "The student account has been removed." });
  };

  const handleDeleteAdmin = (id: string) => {
    if (admins.length <= 1) {
      toast({ title: "Cannot Delete", description: "At least one admin must exist.", variant: "destructive" });
      return;
    }
    setAdmins(admins.filter((a) => a.id !== id));
    setDeleteTarget(null);
    toast({ title: "Admin Deleted", description: "The admin account has been removed." });
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.accUserId || !newAdmin.name || !newAdmin.password) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    const admin: Admin = {
      id: Date.now().toString(),
      accUserId: newAdmin.accUserId,
      name: newAdmin.name,
    };
    setAdmins([...admins, admin]);
    setNewAdmin({ accUserId: "", name: "", password: "" });
    setShowAddAdmin(false);
    toast({ title: "Admin Added", description: "New admin account created successfully." });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Admins
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Accounts ({students.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Year Level</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.studId}</TableCell>
                      <TableCell>{student.accUserId}</TableCell>
                      <TableCell>{student.yearLevel}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{student.course}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedStudent(student)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget({ type: "student", id: student.id })}>
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
        </TabsContent>

        <TabsContent value="admins" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Accounts ({admins.length})
              </CardTitle>
              <Button onClick={() => setShowAddAdmin(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.accUserId}</TableCell>
                      <TableCell>{admin.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedAdmin(admin)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget({ type: "admin", id: admin.id })} disabled={admins.length <= 1}>
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
        </TabsContent>
      </Tabs>

      {/* Student Details Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>Full information for this student account.</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Student ID</Label><p className="font-medium">{selectedStudent.studId}</p></div>
                <div><Label className="text-muted-foreground">User ID</Label><p className="font-medium">{selectedStudent.accUserId}</p></div>
                <div><Label className="text-muted-foreground">Year Level</Label><p className="font-medium">{selectedStudent.yearLevel}</p></div>
                <div><Label className="text-muted-foreground">Course</Label><p className="font-medium">{selectedStudent.course}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin Details Dialog */}
      <Dialog open={!!selectedAdmin} onOpenChange={() => setSelectedAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Details</DialogTitle>
            <DialogDescription>Full information for this admin account.</DialogDescription>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">User ID</Label><p className="font-medium">{selectedAdmin.accUserId}</p></div>
                <div><Label className="text-muted-foreground">Name</Label><p className="font-medium">{selectedAdmin.name}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Admin Dialog */}
      <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>Create a new administrator account.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminUserId">User ID</Label>
              <Input id="adminUserId" value={newAdmin.accUserId} onChange={(e) => setNewAdmin({ ...newAdmin, accUserId: e.target.value })} placeholder="Enter unique user ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminName">Name</Label>
              <Input id="adminName" value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} placeholder="Enter admin name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Password</Label>
              <Input id="adminPassword" type="password" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} placeholder="Enter password" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddAdmin(false)} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1">Create Admin</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the {deleteTarget?.type} account.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget?.type === "student" ? handleDeleteStudent(deleteTarget.id) : handleDeleteAdmin(deleteTarget!.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
