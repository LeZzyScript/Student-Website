import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RegisteredUser {
  accIndex?: number;
  accUserId?: string;
  accRole?: string;
  studId?: string;
  studFirstName?: string;
  studMiddleInitial?: string;
  studLastName?: string;
  studYearLevel?: number;
  studCourse?: string;
}

const StudentProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<RegisteredUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("registeredUser");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as RegisteredUser;
      setUser(parsed);
    } catch {
      // ignore
    }
  }, []);

  const fullName = user
    ? [
        user.studFirstName,
        user.studMiddleInitial && `${user.studMiddleInitial}.`,
        user.studLastName,
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <h1 className="text-lg font-semibold text-foreground">
            Student Information
          </h1>
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container px-4 md:px-8 py-8">
        {!user ? (
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>No student data found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                We couldn&apos;t find any registered student information in this browser.
                Please register first, then return to this page.
              </p>
              <Button onClick={() => navigate("/")}>Go to Home</Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>{fullName || "Student"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Student ID
                  </p>
                  <p className="font-medium">{user.studId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    User ID
                  </p>
                  <p className="font-medium">{user.accUserId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Year Level
                  </p>
                  <p className="font-medium">{user.studYearLevel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Course
                  </p>
                  <p className="font-medium">{user.studCourse}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default StudentProfile;


