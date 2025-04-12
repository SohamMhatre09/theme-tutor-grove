import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserProfile } from "@/components/auth/UserProfile";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { School, ArrowLeft, Users, BookOpen, FileText, MessageSquare, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ClassroomView() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [classroom, setClassroom] = useState({
    id: "",
    name: "",
    subject: "",
    teacher: "",
    description: "",
    schedule: "Mon, Wed, Fri - 10:00 AM to 11:30 AM",
    assignments: [
      { id: "assign1", title: "Introduction to Python Variables", dueDate: "2025-04-20", status: "Completed" },
      { id: "assign2", title: "Control Flow and Loops", dueDate: "2025-04-25", status: "Pending" },
      { id: "assign3", title: "Functions and Modules", dueDate: "2025-05-02", status: "Not Started" },
    ],
    announcements: [
      { id: "ann1", title: "Quiz Postponed", date: "2025-04-10", content: "The quiz scheduled for Friday has been postponed to next Monday." },
      { id: "ann2", title: "Extra Help Session", date: "2025-04-08", content: "I'll be hosting an optional help session this Thursday at 3 PM." },
    ],
    students: Array(18).fill(null).map((_, i) => ({
      id: `student${i+1}`,
      name: `Student ${i+1}`,
      email: `student${i+1}@example.com`,
      joinDate: "2025-03-15",
    })),
  });

  useEffect(() => {
    // Simulate API call to fetch classroom data
    const fetchClassroom = async () => {
      setLoading(true);
      
      // In a real app, you would fetch data from an API based on id
      setTimeout(() => {
        setClassroom(prev => ({
          ...prev,
          id: id || "",
          name: id === "cs101" ? "Introduction to Programming" : "Advanced Python Development",
          subject: id === "cs101" ? "Computer Science" : "Python Programming",
          teacher: id === "cs101" ? "Prof. Sarah Johnson" : "Dr. Michael Chen",
          description: id === "cs101" 
            ? "An introductory course covering programming fundamentals using Python."
            : "Advanced programming techniques and tools using Python.",
        }));
        setLoading(false);
      }, 800);
    };
    
    fetchClassroom();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading classroom...</div>
      </div>
    );
  }

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
              <Link to="/" className="text-sm font-medium text-muted-foreground animate-hover hover:text-foreground">
                My Classrooms
              </Link>
              <Link to="/python-assignments" className="text-sm font-medium text-muted-foreground animate-hover hover:text-foreground">
                Assignments
              </Link>
            </nav>
            <Separator orientation="vertical" className="h-6 hidden md:block" />
            <ThemeToggle />
            <UserProfile />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-6">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link to="/" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Classrooms
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{classroom.name}</h1>
              <p className="text-muted-foreground">{classroom.subject} • Taught by {classroom.teacher}</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <MessageSquare className="h-4 w-4" /> Chat
              </Button>
              <Button size="sm" className="gap-1">
                <FileText className="h-4 w-4" /> Assignments
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
              <TabsTrigger value="classmates">Classmates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Course Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium">Description</h3>
                      <p className="text-muted-foreground">{classroom.description}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Schedule</h3>
                      <p className="text-muted-foreground flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-2" /> {classroom.schedule}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Announcements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {classroom.announcements.slice(0, 2).map(announcement => (
                      <div key={announcement.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                        <h4 className="font-medium">{announcement.title}</h4>
                        <p className="text-xs text-muted-foreground mb-1">{announcement.date}</p>
                        <p className="text-sm">{announcement.content}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Upcoming Assignments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Assignment</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classroom.assignments.map(assignment => (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">{assignment.title}</TableCell>
                            <TableCell>{assignment.dueDate}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                assignment.status === "Completed" 
                                  ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400" 
                                  : assignment.status === "Pending" 
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400"
                              }`}>
                                {assignment.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Class Size</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center py-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center">
                          <Users className="h-12 w-12 text-primary mb-2" />
                        </div>
                        <div className="text-3xl font-bold">{classroom.students.length}</div>
                        <div className="text-sm text-muted-foreground">Students</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="assignments">
              <Card>
                <CardHeader>
                  <CardTitle>Course Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Assignment</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classroom.assignments.map(assignment => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">{assignment.title}</TableCell>
                          <TableCell>{assignment.dueDate}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              assignment.status === "Completed" 
                                ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400" 
                                : assignment.status === "Pending" 
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400"
                            }`}>
                              {assignment.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="announcements">
              <Card>
                <CardHeader>
                  <CardTitle>Announcements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {classroom.announcements.map(announcement => (
                    <div key={announcement.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <h3 className="text-lg font-medium">{announcement.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{announcement.date}</p>
                      <p>{announcement.content}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="classmates">
              <Card>
                <CardHeader>
                  <CardTitle>Your Classmates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {classroom.students.map(student => (
                      <div key={student.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} />
                          <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="border-t border-border py-8 mt-12">
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