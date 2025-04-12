import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CodeEditor } from "@/components/CodeEditor";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Code, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AssignmentPage() {
  const { id } = useParams<{ id: string }>();
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        // Handle both prefix-sum and prefix-sum-problem IDs
        if (id === "prefix-sum" || id === "prefix-sum-problem") {
          console.log("Fetching prefix sum assignment...");
          const response = await fetch("http://localhost:8081/api/assignment/prefix-sum");
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("Received assignment data:", data);
          setCode(data.code);
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
        toast({
          title: "Error",
          description: "Failed to load assignment code. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id, toast]);

  const handleSubmit = async (submittedCode: string) => {
    console.log("Submitting code:", submittedCode);
    try {
      const response = await fetch("http://localhost:8081/api/submit-assignment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: submittedCode }),
      });

      const data = await response.json();
      console.log("Submitted code response:", data);

      toast({
        title: "Success",
        description: "Your code has been submitted successfully!",
      });
    } catch (error) {
      console.error("Error submitting code:", error);
      toast({
        title: "Error",
        description: "Failed to submit your code. Please try again.",
        variant: "destructive"
      });
    }
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
              <Link to="/python-assignments" className="text-sm font-medium text-muted-foreground animate-hover hover:text-foreground">
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

      <main className="flex-1 container py-8">
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link to="/python-assignments">
              <ArrowLeft className="h-4 w-4" />
              Back to Assignments
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : code ? (
          <CodeEditor code={code} onSubmit={handleSubmit} />
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <h2 className="text-xl font-semibold mb-4">No assignment code found</h2>
            <p className="text-muted-foreground mb-4">
              Unable to load the code for this assignment.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}
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