import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AssignmentList } from "@/components/AssignmentList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Code, Layers, BookOpen, User, ArrowRight, BookOpenCheck, Users, Sparkles } from "lucide-react";
import { AuthNav } from "@/components/AuthNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// This component will handle the typing animation
function AnimatedGreeting({ displayText }) {
  const [typingComplete, setTypingComplete] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  
  // Reset animation when displayText changes
  useEffect(() => {
    setTextIndex(0);
    setTypingComplete(false);
  }, [displayText]);
  
  // Faster, smoother typing animation effect
  useEffect(() => {
    if (textIndex < displayText.length && !typingComplete) {
      const typingTimer = setTimeout(() => {
        setTextIndex(prevIndex => prevIndex + 1);
      }, 20); // Faster typing speed (30ms instead of 50ms)
      
      return () => clearTimeout(typingTimer);
    } else if (textIndex >= displayText.length) {
      setTypingComplete(true);
    }
  }, [textIndex, displayText, typingComplete]);
  
  return (
    <h1 className="text-3xl font-bold tracking-tight">
      {displayText.substring(0, textIndex)}
    </h1>
  );
}

export default function Dashboard() {
  const [greeting, setGreeting] = useState("");
  const [motivationalMsg, setMotivationalMsg] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [refreshKey, setRefreshKey] = useState(Date.now()); // Add a key that changes on refresh
  const [enrolledBatches, setEnrolledBatches] = useState([]);
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set greeting based on time of day
    const setTimeBasedGreeting = () => {
      const hour = new Date().getHours();
      const greetings = [
        "Level up your coding skills!",
        "Let's build something fire today!",
        "Code mode: activated!",
        "Main character energy today!",
        "Coding projects? Let's slay!",
        "These skills? Absolutely elite!",
        "Time to cook up some code!",
        "Build something legendary now!",
        "Your code? Immaculate vibes!",
        "Creating the future, frfr."
      ];
      
      let timeGreeting = "";
      if (hour < 12) {
        timeGreeting = "Good morning!";
      } else if (hour < 17) {
        timeGreeting = "Good afternoon!";
      } else {
        timeGreeting = "Good evening!";
      }
      
      // Select a random encouraging message
      const randomIndex = Math.floor(Math.random() * greetings.length);
      setGreeting(timeGreeting);
      setMotivationalMsg(greetings[randomIndex]);
      
      // Create combined message for animation
      const combinedMessage = `${timeGreeting} ${greetings[randomIndex]}`;
      setDisplayText(combinedMessage);
    };

    setTimeBasedGreeting();

    // Fetch enrolled batches
    const fetchEnrolledBatches = async () => {
      try {
        const response = await fetch('/api/batches/enrolled', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setEnrolledBatches(data);
        }
      } catch (error) {
        console.error('Error fetching enrolled batches:', error);
      }
    };

    // Fetch student assignments
    const fetchStudentAssignments = async () => {
      try {
        const response = await fetch('/api/student/assignments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStudentAssignments(data);
        }
      } catch (error) {
        console.error('Error fetching student assignments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrolledBatches();
    fetchStudentAssignments();
  }, [refreshKey]); // Add refreshKey as a dependency

  // Calculate pending assignments
  const pendingAssignments = studentAssignments.filter(
    assignment => !assignment.submitted
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border">
        <div className="container h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">CodeLearn</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium animate-hover hover:text-primary">
                Dashboard
              </Link>
              <Link to="/courses" className="text-sm font-medium text-muted-foreground animate-hover hover:text-foreground">
                Courses
              </Link>
              <Link to="/progress" className="text-sm font-medium text-muted-foreground animate-hover hover:text-foreground">
                My Progress
              </Link>
            </nav>
            <Separator orientation="vertical" className="h-6 hidden md:block" />
            <ThemeToggle />
            <AuthNav />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-primary/5 dark:bg-primary/10 py-10 border-b border-border">
          <div className="container">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-primary" />
                {/* Use the AnimatedGreeting component with key for refresh */}
                <AnimatedGreeting key={refreshKey} displayText={displayText} />
              </div>
              <div className="flex items-center text-sm text-muted-foreground mt-4">
                <span className="inline-flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {pendingAssignments} pending assignments
                </span>
                <span className="mx-2">•</span>
                <span className="inline-flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {enrolledBatches.length} enrolled courses
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8">
          <Tabs defaultValue="batches" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="batches">My Batches</TabsTrigger>
              <TabsTrigger value="assignments">
                Assignments
                {pendingAssignments > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingAssignments}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="batches" className="pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <p>Loading your enrolled batches...</p>
                ) : enrolledBatches.length > 0 ? (
                  enrolledBatches.map((batch) => (
                    <Card key={batch._id} className="overflow-hidden border border-border/40 hover:border-border/80 transition-all">
                      <CardHeader className="bg-primary/5 dark:bg-primary/10 pb-3">
                        <CardTitle className="text-lg">{batch.class.name}</CardTitle>
                        <CardDescription>
                          {batch.class.subject} • Teacher: {batch.class.teacher.username}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {batch.students.length} students enrolled
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="mb-1">
                            {batch.schedule || "Flexible Schedule"}
                          </Badge>
                          <Button size="sm" asChild variant="secondary" className="gap-1">
                            <Link to={`/batches/${batch._id}`}>
                              View Details <ArrowRight className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <BookOpen className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium mb-2">No batches found</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      You're not enrolled in any batches yet.
                    </p>
                    <Button asChild size="sm">
                      <Link to="/available-batches">Browse Available Batches</Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="assignments" className="pt-2">
              <div className="space-y-4">
                {isLoading ? (
                  <p>Loading your assignments...</p>
                ) : studentAssignments.length > 0 ? (
                  studentAssignments.map((item) => (
                    <Card key={item._id} className="border border-border/40 hover:border-border/80 transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{item.assignment.title}</CardTitle>
                            <CardDescription>
                              {item.assignment.class.name} • {item.assignment.class.subject}
                            </CardDescription>
                          </div>
                          <Badge variant={item.submitted ? "success" : "destructive"}>
                            {item.submitted ? "Submitted" : "Pending"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-3 line-clamp-2">
                          {item.assignment.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Due:</span>{" "}
                            {new Date(item.assignment.dueDate).toLocaleDateString()}
                          </div>
                          <Button size="sm" asChild variant={item.submitted ? "outline" : "default"} className="gap-1">
                            <Link to={`/assignments/${item.assignment._id}`}>
                              {item.submitted ? "View Submission" : "Start Working"} <ArrowRight className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <BookOpenCheck className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      You don't have any assignments right now.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <span className="font-medium">CodeLearn</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CodeLearn. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}