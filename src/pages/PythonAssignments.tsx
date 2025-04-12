import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";
import { Code, User } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description?: string;
}

export default function PythonAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    // In a real application, these would come from an API
    setAssignments([
      {
        id: "prefix-sum-problem",
        title: "Prefix Sum Problem",
        description: "Implement a function to calculate the prefix sum of a list of integers."
      }
    ]);
  }, []);

  const handleExecute = (assignmentId: string) => {
    navigate(`/python-assignment/${assignmentId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="container h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">CodeLearn</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-muted-foreground animate-hover hover:text-foreground">
                Dashboard
              </Link>
              <Link to="/python-assignments" className="text-sm font-medium animate-hover hover:text-primary">
                Python Assignments
              </Link>
            </nav>
            <Separator orientation="vertical" className="h-6 hidden md:block" />
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-primary/5 dark:bg-primary/10 py-12 border-b border-border">
          <div className="container">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Python Assignments
              </h1>
              <p className="text-xl text-muted-foreground">
                Practice your Python skills with these interactive assignments
              </p>
            </div>
          </div>
        </section>

        <section className="container py-12">
          <h2 className="text-2xl font-semibold mb-8">Available Assignments</h2>
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{assignment.title}</CardTitle>
                  <Button onClick={() => handleExecute(assignment.id)}>Execute</Button>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{assignment.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
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