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
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface RegisterFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const courses = ["BSIT", "BSN", "BSCRIM", "BSHM", "BSMT"];
const yearLevels = ["1", "2", "3", "4"];

export const RegisterForm = ({ onClose, onSuccess }: RegisterFormProps) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [course, setCourse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [generatedStudentId, setGeneratedStudentId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim() || !password.trim() || !confirmPassword.trim() || !yearLevel || !course) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5256/api/accounts/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          password,
          yearLevel: Number(yearLevel),
          course,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        toast.error(message || "Registration failed");
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      const userData = {
        accIndex: data.accIndex,
        accUserId: data.accUserId,
        accRole: data.accRole,
        studId: data.studStudentId,
        studYearLevel: data.studYearLevel,
        studCourse: data.studCourse,
      };

      localStorage.setItem("registeredUser", JSON.stringify(userData));

      setGeneratedStudentId(data.studStudentId);
      setRegistrationComplete(true);
      setIsLoading(false);
      onSuccess?.();
    } catch {
      toast.error("Unable to register. Please try again.");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (registrationComplete) {
    return (
      <div className="space-y-6 text-center py-4">
        <div className="space-y-2">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">Registration Successful!</h3>
          <p className="text-sm text-muted-foreground">Please save your Student ID below</p>
        </div>
        
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
          <p className="text-sm text-muted-foreground">Your Student ID</p>
          <p className="text-2xl font-bold text-primary tracking-wider">{generatedStudentId}</p>
          <p className="text-xs text-muted-foreground">Keep this ID safe - you'll need it for your records</p>
        </div>

        <Button onClick={handleClose} className="w-full">
          I've Saved My ID - Close
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="userId">User ID</Label>
        <Input
          id="userId"
          type="text"
          placeholder="Enter a unique user ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="regPassword">Password</Label>
        <div className="relative">
          <Input
            id="regPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearLevel">Year Level</Label>
        <Select value={yearLevel} onValueChange={setYearLevel}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select year level" />
          </SelectTrigger>
          <SelectContent>
            {yearLevels.map((level) => (
              <SelectItem key={level} value={level}>
                Year {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="course">Course</Label>
        <Select value={course} onValueChange={setCourse}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Registering...
            </span>
          ) : (
            "Register"
          )}
        </Button>
      </div>
    </form>
  );
};
