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
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [course, setCourse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [generatedStudentId, setGeneratedStudentId] = useState("");  // Already a string

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !userId.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !yearLevel ||
      !course
    ) {
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
        credentials: 'include',
        body: JSON.stringify({
          firstName,
          middleInitial,
          lastName,
          userId,
          password,
          yearLevel: Number(yearLevel),
          course,
        }),
      });

      if (!response.ok) {
         let errorMessage = "Registration failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.title || errorMessage;
        } catch (e) {
          const text = await response.text();
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      try {
        const loginResponse = await fetch("http://localhost:5256/api/accounts/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({
            userId,
            password
          }),
        });
        if (!loginResponse.ok) {
          throw new Error('Auto-login failed');
        }
        const loginData = await loginResponse.json();
        //Update user data with any additional info from login
        const userData = {
          accIndex: data.accIndex,
          accUserId: data.accUserId,
          accRole: data.accRole,
          studId: String(data.studId),
          studFirstName: firstName,
          studMiddleInitial: middleInitial,
          studLastName: lastName,
          studYearLevel: data.studYearLevel,
          studCourse: data.studCourse,
          // Add any additional fields from login response
          ...loginData
        };
        localStorage.setItem("registeredUser", JSON.stringify(userData));
        setGeneratedStudentId(String(data.studId));
        setRegistrationComplete(true);
        onSuccess?.();
      } catch (loginError) {
        // Still proceed with registration success even if auto-login fails
        const userData = {
          accIndex: data.accIndex,
          accUserId: data.accUserId,
          accRole: data.accRole,
          studId: String(data.studId),
          studFirstName: firstName,
          studMiddleInitial: middleInitial,
          studLastName: lastName,
          studYearLevel: data.studYearLevel,
          studCourse: data.studCourse,
        };
        localStorage.setItem("registeredUser", JSON.stringify(userData));
        setGeneratedStudentId(String(data.studId));
        setRegistrationComplete(true);
        onSuccess?.();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (registrationComplete) {
    return (
      <div className="space-y-4 text-center py-4">
        <h3 className="text-lg font-semibold text-foreground">Registration successful</h3>
        <p className="text-sm text-muted-foreground">Your Student ID:</p>
        <p className="text-2xl font-mono font-bold text-primary tracking-wider">
          {generatedStudentId}
        </p>
        <Button onClick={handleClose} className="w-full mt-2">
          Close
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          type="text"
          placeholder="Enter first name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="h-10"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="middleInitial">M.I.</Label>
          <Input
            id="middleInitial"
            type="text"
            maxLength={1}
            placeholder="M"
            value={middleInitial}
            onChange={(e) => setMiddleInitial(e.target.value.toUpperCase())}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-1.5">
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

      <div className="space-y-1.5">
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

      <div className="space-y-1.5">
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

      <div className="space-y-1.5">
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
