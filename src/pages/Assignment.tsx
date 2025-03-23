
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getAssignmentById, 
  getUserCode, 
  saveUserCode 
} from "@/lib/assignments";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { InstructionPanel } from "@/components/InstructionPanel";
import { CodeEditor } from "@/components/CodeEditor";
import { CodeOutput } from "@/components/CodeOutput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, LayoutPanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

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

  useEffect(() => {
    if (id) {
      const assignmentData = getAssignmentById(id);
      if (assignmentData) {
        setAssignment(assignmentData);
        // Load saved code for the first step if available
        const savedCode = getUserCode(id, assignmentData.steps[0].id);
        if (savedCode) {
          setCode(savedCode);
        } else {
          setCode(assignmentData.steps[0].starterCode || "");
        }
      } else {
        setError("Assignment not found");
      }
    }
  }, [id]);

  useEffect(() => {
    if (assignment && currentStepIndex < assignment.steps.length) {
      const stepId = assignment.steps[currentStepIndex].id;
      const savedCode = getUserCode(id, stepId);
      if (savedCode) {
        setCode(savedCode);
      } else {
        setCode(assignment.steps[currentStepIndex].starterCode || "");
      }
    }
  }, [assignment, currentStepIndex, id]);

  const handleStepChange = (stepIndex: number) => {
    // Save current code before changing steps
    if (assignment) {
      saveUserCode(id, assignment.steps[currentStepIndex].id, code);
    }
    setCurrentStepIndex(stepIndex);
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    // Auto-save code changes
    if (assignment) {
      saveUserCode(id, assignment.steps[currentStepIndex].id, newCode);
    }
  };

  const handleRunCode = (codeToRun: string) => {
    setRunning(true);
    // The actual running happens in the CodeOutput component
    setTimeout(() => setRunning(false), 100);
  };

  const handleResetCode = () => {
    if (assignment) {
      const starterCode = assignment.steps[currentStepIndex].starterCode || "";
      setCode(starterCode);
      saveUserCode(id, assignment.steps[currentStepIndex].id, starterCode);
      toast({
        title: "Code reset",
        description: "Your code has been reset to the starter code",
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
          <Button onClick={() => navigate("/")}>Go Back to Dashboard</Button>
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
                { label: assignment.module, href: "/" },
                { label: assignment.title },
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
        <div className="h-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
          {showPanels && (
            <section className="border-r border-border h-full overflow-hidden">
              <InstructionPanel
                assignment={assignment}
                currentStepIndex={currentStepIndex}
                onStepChange={handleStepChange}
              />
            </section>
          )}
          
          <section className={showPanels ? "col-span-1 md:col-span-1 lg:col-span-1" : "col-span-1 md:col-span-3 lg:col-span-3"}>
            <CodeEditor
              step={assignment.steps[currentStepIndex]}
              savedCode={code}
              onCodeChange={handleCodeChange}
              onRunCode={handleRunCode}
              onResetCode={handleResetCode}
            />
          </section>

          {showPanels && (
            <section className="border-l border-border h-full overflow-hidden">
              <CodeOutput
                assignmentId={id}
                step={assignment.steps[currentStepIndex]}
                code={code}
                isRunning={running}
              />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
