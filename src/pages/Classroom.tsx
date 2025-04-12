import { useState } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserProfile } from "@/components/auth/UserProfile";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Code, Users, School, ArrowRight, BookOpen } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Classroom {
  id: string;
  name: string;
  teacher: string;
  subject: string;
  studentCount: number;
  joinedAt: string;
}

export default function Classroom() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([
    {
      id: "cs101",
      name: "Introduction to Programming",
      teacher: "Prof. Sarah Johnson",
      subject: "Computer Science",
      studentCount: 28,
      joinedAt: "2025-03-15",
    },
    {
      id: "py202",
      name: "Advanced Python Development",
      teacher: "Dr. Michael Chen",
      subject: "Python Programming",
      studentCount: 24,
      joinedAt: "2025-03-20",
    }
  ]);
  
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleJoinClassroom = () => {
    setIsJoining(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (joinCode.trim()) {
        // Add new classroom
        const newClassroom: Classroom = {
          id: `class-${Date.now()}`,
          name: `Class ${joinCode.substring(0, 3).toUpperCase()}`,
          teacher: `Prof. ${joinCode.charAt(0).toUpperCase() + joinCode.slice(1)}`,
          subject: "New Course",
          studentCount: Math.floor(Math.random() * 30) + 10,
          joinedAt: new Date().toISOString().split('T')[0],
        };
        
        setClassrooms([...classrooms, newClassroom]);
        
        toast({
          title: "Success!",
          description: `You've joined the classroom "${newClassroom.name}"`,
        });
        
        setJoinCode("");
        setIsOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Please enter a valid join code",
          variant: "destructive",
        });
      }
      
      setIsJoining(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="container h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <School className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">CodeClassroom</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium animate-hover hover:text-primary">
                My Classrooms
              </Link>
              <Link to="/python-assignments" className="text-sm font-medium text-muted-foreground animate-hover hover:text-foreground">
                Assignments
              </Link>
              <Link to="/courses" className="text-sm font-medium text-muted-foreground animate-hover hover:text-foreground">
                Resources
              </Link>
            </nav>
            <Separator orientation="vertical" className="h-6 hidden md:block" />
            <ThemeToggle />
            <UserProfile />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-primary/5 dark:bg-primary/10 py-12 border-b border-border">
          <div className="container">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Your Classrooms
              </h1>
              <p className="text-xl text-muted-foreground">
                Access your virtual classrooms and continue learning with your teachers and peers
              </p>
            </div>
          </div>
        </section>

        <section className="container py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">Enrolled Classrooms</h2>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Join Classroom
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Join a Classroom</DialogTitle>
                  <DialogDescription>
                    Enter the classroom code provided by your teacher to join.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="classroom-code">Classroom Code</Label>
                    <Input
                      id="classroom-code"
                      placeholder="Enter code (e.g., CS101)"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleJoinClassroom}
                    disabled={isJoining || !joinCode.trim()}
                  >
                    {isJoining ? "Joining..." : "Join Classroom"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {classrooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classrooms.map((classroom) => (
                <Card key={classroom.id} className="transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{classroom.name}</CardTitle>
                    <CardDescription>{classroom.subject}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Teacher:</span> {classroom.teacher}
                    </div>
                    <div className="text-sm flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" /> 
                      <span>{classroom.studentCount} students</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Joined on {new Date(classroom.joinedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/classroom/${classroom.id}`}>
                        Enter Classroom
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <School className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No classrooms yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                You haven't joined any classrooms yet. Ask your teacher for a classroom code to get started.
              </p>
              <Button onClick={() => setIsOpen(true)}>Join Your First Classroom</Button>
            </div>
          )}
        </section>

        <section className="container py-12 border-t border-border">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-4">Are you a teacher?</h2>
            <p className="text-muted-foreground mb-6">
              Create your own virtual classroom to manage students and assignments
            </p>
            <Button variant="outline" asChild>
              <Link to="/create-classroom">
                <BookOpen className="mr-2 h-4 w-4" /> Create a Classroom
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <School className="h-5 w-5 text-primary" />
            <span className="font-medium">CodeClassroom</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CodeClassroom. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}