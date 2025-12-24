import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarPlus, Check, X, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ErrorBoundary } from 'react-error-boundary';
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <ActivityManagement />
</ErrorBoundary>

interface ActivityRequest {
  id: string;
  activityName: string;
  description: string;
  organizers: string[];
  submittedBy: string;
  submittedDate: string;
  scheduledDate: string;  
  publishedDate: string;  
  status: "pending" | "approved" | "declined";
}

export function ActivityManagement() {
  const [activities, setActivities] = useState<ActivityRequest[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityRequest | null>(null);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const res = await fetch("http://localhost:5256/api/activities");
        if (!res.ok) return;
        const data = await res.json();
        const mapped: ActivityRequest[] = data.map((a: any) => ({
          id: String(a.act_Id),
          activityName: a.act_Name,
          description: a.act_Description,
          organizers: [a.organizer?.org_Organization ?? "Organizer"],
          submittedBy: a.student ? `${a.student.stud_StudentId}` : "Unknown",
          submittedDate: a.act_DateCreated ? new Date(a.act_DateCreated).toLocaleDateString() : "N/A",
          scheduledDate: a.act_ScheduledDate ? new Date(a.act_ScheduledDate).toLocaleDateString() : "Not scheduled",
          publishedDate: a.act_DateCreated ? new Date(a.act_DateCreated).toLocaleDateString() : "N/A",
          status: a.act_IsGranted ? "approved" : "pending",
        }));
        setActivities(mapped);
      } catch {
        // ignore
      }
    };
    loadActivities();
  }, []);

  const handleApprove = (id: string) => {
    setActivities(activities.map((a) => 
      a.id === id ? { ...a, status: "approved" as const } : a
    ));
    toast({
      title: "Activity Approved",
      description: "The activity has been approved. The student will be notified.",
    });
    setSelectedActivity(null);
  };

  const handleDecline = (id: string) => {
    setActivities(activities.map((a) => 
      a.id === id ? { ...a, status: "declined" as const } : a
    ));
    toast({
      title: "Activity Declined",
      description: "The activity has been declined. The student will be notified.",
      variant: "destructive",
    });
    setSelectedActivity(null);
  };

  const pendingActivities = activities.filter((a) => a.status === "pending");
  const reviewedActivities = activities.filter((a) => a.status !== "pending");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case "declined":
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Declined</Badge>;
      default:
        return null;
    }
  };

  const ActivityTable = ({ items, showActions }: { items: ActivityRequest[]; showActions?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Activity</TableHead>
          <TableHead>Organizer</TableHead>
          <TableHead>Submitted By</TableHead>
          <TableHead>Published Date</TableHead>
          <TableHead>Scheduled Date</TableHead>
          <TableHead>Status</TableHead>
          {showActions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((activity) => (
          <TableRow key={activity.id}>
            <TableCell className="font-medium">{activity.activityName}</TableCell>
            <TableCell>{activity.organizers.join(", ")}</TableCell>
            <TableCell>{activity.submittedBy}</TableCell>
            <TableCell>{new Date(activity.submittedDate).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(activity.scheduledDate).toLocaleDateString()}</TableCell>
            <TableCell>{getStatusBadge(activity.status)}</TableCell>
            {showActions && (
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedActivity(activity)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  {activity.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(activity.id)}
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDecline(activity.id)}
                    >
                      <X className="h-4 w-4 mr-1" /> Decline
                    </Button>
                  </>
                )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingActivities.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Reviewed ({reviewedActivities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarPlus className="h-5 w-5" />
                Pending Activity Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTable items={pendingActivities} showActions />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviewed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarPlus className="h-5 w-5" />
                Reviewed Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTable items={reviewedActivities} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Activity Details Dialog */}
      <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedActivity?.activityName}
              {selectedActivity && getStatusBadge(selectedActivity.status)}
            </DialogTitle>
            // In the dialog section of ActivityManagement.tsx:
<DialogDescription>
  <div className="mt-2 space-y-2">
    <p>{selectedActivity.description}</p>
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div>
        <p className="text-sm font-medium">Published Date</p>
        <p className="text-sm text-muted-foreground">
          {selectedActivity.publishedDate}
        </p>
      </div>
      <div>
        <p className="text-sm font-medium">Scheduled Date</p>
        <p className="text-sm text-muted-foreground">
          {selectedActivity.scheduledDate}
        </p>
      </div>
      <div>
        <p className="text-sm font-medium">Status</p>
        <div className="mt-1">
          {getStatusBadge(selectedActivity.status)}
        </div>
      </div>
    </div>
  </div>
</DialogDescription>
          </DialogHeader>
          
          {selectedActivity && (
            <div className="space-y-4 py-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                <p className="text-sm">{selectedActivity.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Organizers</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedActivity.organizers.map((org) => (
                    <Badge key={org} variant="secondary">{org}</Badge>
                  ))}
                </div>
              </div>

              {selectedActivity.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={() => handleApprove(selectedActivity.id)} className="flex-1 bg-green-600 hover:bg-green-700">
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button variant="destructive" onClick={() => handleDecline(selectedActivity.id)} className="flex-1">
                    <X className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
