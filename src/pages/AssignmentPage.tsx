import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CodeEditor } from "@/components/CodeEditor";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Code, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ResizableLayout } from "@/components/ResizableLayout";
import { AssignmentSidebar } from "@/components/AssignmentSidebar";
import { OutputPanel } from "@/components/OutputPanel";

interface Module {
  id: number;
  title: string;
  learningText: string;
  codeTemplate: string;
  hints: string[];
  expectedOutput: string;
}

interface Assignment {
  title: string;
  description: string;
  modules: Module[];
}

export default function AssignmentPage() {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [output, setOutput] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeModuleId, setActiveModuleId] = useState<number>(1);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        
        // For now, we'll use the static JSON file instead of an API call
        // Get the assignment.json file and parse it
        const assignmentConfig = await import("../../code-execution-api/assignment.json");
        const data = assignmentConfig.assignment;
        
        if (data) {
          setAssignment({
            title: data.title,
            description: data.description,
            modules: data.modules
          });
          
          // Set the first module as active by default
          if (data.modules && data.modules.length > 0) {
            setActiveModuleId(data.modules[0].id);
          }
        } else {
          throw new Error("No assignment data found");
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
        toast({
          title: "Error",
          description: "Failed to load assignment. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
    
    // Reset completed modules on page refresh
    setCompletedModules([]);
    
  }, [id, toast]);

  const handleSubmit = async (submittedCode: string, moduleId: number) => {
    console.log(`Submitting code for module ${moduleId}:`, submittedCode);
    
    try {
      // First run the code to verify it works
      await handleRun(submittedCode, moduleId);
      
      // Add this module to completed modules if not already
      if (!completedModules.includes(moduleId)) {
        setCompletedModules(prev => [...prev, moduleId]);
      }
      
      toast({
        title: "Success",
        description: "Your solution has been submitted successfully!",
      });
      
      // If there are more modules, advance to the next one
      if (assignment?.modules) {
        const currentIndex = assignment.modules.findIndex(m => m.id === moduleId);
        if (currentIndex !== -1 && currentIndex < assignment.modules.length - 1) {
          const nextModule = assignment.modules[currentIndex + 1];
          setActiveModuleId(nextModule.id);
        }
      }
    } catch (error) {
      console.error("Error submitting code:", error);
      toast({
        title: "Error",
        description: "Failed to submit your code. Please check for errors and try again.",
        variant: "destructive"
      });
    }
  };

  const handleRun = async (code: string, moduleId: number) => {
    setIsExecuting(true);
    setOutput("Running code...");
    
    try {
      // Execute the code via the API
      const response = await fetch("http://localhost:8000/execute/code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          assignment_name: "sample_assignment", // Use a generic name instead of the id
          language: "python", 
          code: code
        }),
      });
      
      const data = await response.json();
      
      // Format the output nicely
      let formattedOutput = "";
      
      if (data.output) {
        formattedOutput += data.output;
      }
      
      if (data.error || data.detail) {
        formattedOutput += "\n\n" + (data.error || data.detail);
      }
      
      setOutput(formattedOutput || "No output");
    } catch (error) {
      console.error("Error executing code:", error);
      setOutput(`Error executing code: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  };

  const handleModuleSelect = (moduleId: number) => {
    setActiveModuleId(moduleId);
    setOutput("");
  };

  const handleModuleSuccess = () => {
    // Mark module as completed when output matches expected output
    if (!completedModules.includes(activeModuleId)) {
      setCompletedModules(prev => [...prev, activeModuleId]);
    }
  };

  const getActiveModule = () => {
    if (!assignment) return null;
    return assignment.modules.find(m => m.id === activeModuleId) || null;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border z-10">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link to="/python-assignments">
                <ArrowLeft className="h-4 w-4" />
                Back to Assignments
              </Link>
            </Button>
          </div>
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

      {loading ? (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : assignment ? (
        <main className="flex-1 flex flex-col">
          <div className="flex-1 h-[calc(100vh-4rem)]">
            <ResizableLayout
              leftContent={
                <AssignmentSidebar 
                  title={assignment.title}
                  description={assignment.description}
                  modules={assignment.modules}
                  activeModuleId={activeModuleId}
                  completedModules={completedModules}
                  onModuleSelect={handleModuleSelect}
                />
              }
              centerContent={
                getActiveModule() ? (
                  <CodeEditor 
                    key={`editor-${activeModuleId}`} // Force recreation when module changes
                    module={getActiveModule()!}
                    onSubmit={handleSubmit}
                    onRun={handleRun}
                    isExecuting={isExecuting}
                    assignmentName={id || undefined}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2">No module selected</h3>
                      <p className="text-muted-foreground">Select a module from the sidebar to start coding</p>
                    </div>
                  </div>
                )
              }
              rightContent={
                <OutputPanel 
                  output={output}
                  isExecuting={isExecuting}
                  expectedOutput={getActiveModule()?.expectedOutput}
                  onSuccess={handleModuleSuccess}
                />
              }
            />
          </div>
        </main>
      ) : (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-center">
          <h2 className="text-xl font-semibold mb-4">No assignment found</h2>
          <p className="text-muted-foreground mb-4">
            Unable to load this assignment.
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
} 