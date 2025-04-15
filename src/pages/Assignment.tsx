import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getAssignmentById, 
  getUserCode, 
  saveUserCode,
  markStepCompleted
} from "@/lib/assignments";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { InstructionPanel } from "@/components/InstructionPanel";
import { CodeEditor } from "@/components/CodeEditor";
import { CodeOutput } from "@/components/CodeOutput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ResizableLayout } from "@/components/ResizableLayout";
import { ArrowLeft, LayoutPanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { OutputPanel } from "@/components/OutputPanel";

export default function Assignment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assignment, setAssignment] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [showPanels, setShowPanels] = useState(true);
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (id) {
      // Fetch the assignment data
      fetch(`http://localhost:5000/api/assignments/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data && data._id) {
            // The data is the assignment object directly, not nested under "assignment"
            setAssignment(data);
            // Initialize with first module's code
            if (data.modules && data.modules.length > 0) {
              setCode(data.modules[0].codeTemplate || "");
            }
          } else {
            setError("Assignment not found");
          }
        })
        .catch(err => {
          console.error("Error fetching assignment:", err);
          setError("Failed to load assignment");
        });
    }
  }, [id]);

  const handleModuleChange = (moduleIndex) => {
    if (assignment && assignment.modules && assignment.modules[moduleIndex]) {
      // Save current code before changing modules
      saveUserCode(id, assignment.modules[currentStepIndex].id, code);
      
      setCurrentStepIndex(moduleIndex);
      
      // Load code for the new module
      const savedCode = getUserCode(id, assignment.modules[moduleIndex].id);
      if (savedCode) {
        setCode(savedCode);
      } else {
        setCode(assignment.modules[moduleIndex].codeTemplate || "");
      }
      
      // Clear output when switching modules
      setOutput("");
    }
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    // Auto-save code
    if (assignment) {
      saveUserCode(id, assignment.modules[currentStepIndex].id, newCode);
    }
  };

  const handleRunCode = async () => {
    if (!assignment) return;
    
    setRunning(true);
    setOutput("Running code...");
    
    try {
      // Preprocess the code to remove <editable> and </editable> tags
      const processedCode = code.replace(/<editable>|<\/editable>/g, '');
      
      // Execute the code via your API
      const response = await fetch("http://localhost:8000/execute/code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          assignment_name: id,
          language: "python", 
          code: processedCode
        }),
      });
      
      const data = await response.json();
      
      // Format the output
      let formattedOutput = "";
      
      if (data.output) {
        formattedOutput += data.output;
      }
      
      if (data.error || data.detail) {
        formattedOutput += "\n\n" + (data.error || data.detail);
      }
      
      setOutput(formattedOutput || "No output");
      
      // Check if output matches expected output
      const currentModule = assignment.modules[currentStepIndex];
      if (currentModule.expectedOutput && formattedOutput.trim() === currentModule.expectedOutput.trim()) {
        markStepCompleted(id, currentModule.id);
        toast({
          title: "Success!",
          description: "Your solution is correct. Great job!",
        });
      }
    } catch (error) {
      console.error("Error executing code:", error);
      setOutput(`Error executing code: ${error.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleResetCode = () => {
    if (assignment) {
      const templateCode = assignment.modules[currentStepIndex].codeTemplate || "";
      setCode(templateCode);
      toast({
        title: "Code reset",
        description: "Your code has been reset to the template",
      });
    }
  };

  const togglePanels = () => {
    setShowPanels(!showPanels);
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{error}</h1>
          <Button onClick={() => navigate("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse-light">Loading assignment...</div>
      </div>
    );
  }

  // Get the current module
  const currentModule = assignment.modules[currentStepIndex];

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="container h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <BreadcrumbNav
              items={[
                { label: "Assignments", href: "/" },
                { label: assignment.title },
                { label: currentModule.title },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePanels}
              className="rounded-full"
              title={showPanels ? "Hide side panels" : "Show side panels"}
            >
              <LayoutPanelLeft className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <ResizableLayout
          leftContent={
            showPanels && (
              <InstructionPanel
                assignment={assignment}
                currentStepIndex={currentStepIndex}
                onStepChange={handleModuleChange}
              />
            )
          }
          centerContent={
            <CodeEditor
              module={currentModule}
              onSubmit={handleRunCode}
              onRun={handleRunCode}
              isExecuting={running}
              assignmentName={assignment.title}
              code={code} // Pass the current code as a prop
              onCodeChange={handleCodeChange} // Pass the change handler as a prop
            />
          }
          rightContent={
            showPanels && (
              <OutputPanel
                output={output}
                isExecuting={running}
                expectedOutput={currentModule.expectedOutput}
                onSuccess={() => {
                  // Mark module as completed when output matches
                  markStepCompleted(id, currentModule.id);
                }}
              />
            )
          }
          showLeft={showPanels}
          showRight={showPanels}
        />
      </main>
    </div>
  );
}
