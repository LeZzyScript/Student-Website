import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { RegisterForm } from "@/components/forms/RegisterForm";

// Simulated admin credentials
const ADMIN_ID = "119904100228";
const ADMIN_PASSWORD = "admin123";

const Index = () => {
  const navigate = useNavigate();
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idNumber.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      // Keep special-case admin for now
      if (idNumber === ADMIN_ID && password === ADMIN_PASSWORD) {
        localStorage.setItem("currentUser", JSON.stringify({
          role: "admin",
          userId: ADMIN_ID,
        }));
        toast.success("Welcome, Administrator!");
        navigate("/admin");
        setIsLoading(false);
        return;
      }

      const res = await fetch("http://localhost:5256/api/accounts/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: idNumber, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        toast.error(text || "Invalid credentials. Please check your ID and password.");
        setIsLoading(false);
        return;
      }

      const data = await res.json();

      // Save current user from backend
      localStorage.setItem("currentUser", JSON.stringify(data));

      if (data.role === "student") {
        // Also keep registeredUser for forms/profile
        localStorage.setItem("registeredUser", JSON.stringify({
          accIndex: data.accIndex,
          accUserId: data.accUserId,
          accRole: data.role,
          studId: data.studStudentId,
          studFirstName: data.studFirstName,
          studMiddleInitial: data.studMiddleInitial,
          studLastName: data.studLastName,
          studYearLevel: data.studYearLevel,
          studCourse: data.studCourse,
        }));

        toast.success("Login successful!");
        navigate("/dashboard");
      } else if (data.role === "admin") {
        toast.success("Welcome, Administrator!");
        navigate("/admin");
      } else {
        toast.error("Unknown role.");
      }

      setIsLoading(false);
    } catch {
      setIsLoading(false);
      toast.error("Unable to sign in. Please try again.");
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-300 border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Student Request Forms
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your credentials to access the portal
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="idNumber" className="text-sm font-medium">
                  User ID
                </Label>
                <Input
                  id="idNumber"
                  type="text"
                  placeholder="Enter your User ID"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 font-medium transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button 
                onClick={() => setShowRegister(true)}
                className="text-primary hover:underline font-medium"
              >
                Register Account
              </button>
            </p>
          </CardContent>
        </Card>
        
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © 2024 Student Request Forms. All rights reserved.
        </p>
      </div>

      {/* Register Dialog */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Account</DialogTitle>
            <DialogDescription>
              Register a new student account to access the portal.
            </DialogDescription>
          </DialogHeader>
          <RegisterForm onClose={() => setShowRegister(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
