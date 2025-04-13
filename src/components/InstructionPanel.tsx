import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StepNavigation } from "@/components/StepNavigation";
import { Lightbulb, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface InstructionPanelProps {
  assignment: any;
  currentStepIndex: number;
  onStepChange: (stepIndex: number) => void;
}

export function InstructionPanel({
  assignment,
  currentStepIndex,
  onStepChange,
}: InstructionPanelProps) {
  const { toast } = useToast();
  const [showHint, setShowHint] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const currentModule = assignment.modules[currentStepIndex];
  const totalModules = assignment.modules.length;
  const isFirstModule = currentStepIndex === 0;
  const isLastModule = currentStepIndex === totalModules - 1;

  const handlePrevious = () => {
    if (!isFirstModule) {
      onStepChange(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (!isLastModule) {
      onStepChange(currentStepIndex + 1);
    }
  };

  // The error is here - assignment.steps doesn't exist
  // Instead, use the currentModule which is from assignment.modules[currentStepIndex]
  const currentStep = currentModule;

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  const copyExample = async () => {
    if (currentStep.codeTemplate) {
      await navigator.clipboard.writeText(currentStep.codeTemplate);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderContent = (content: string) => {
    // Very simple Markdown parsing (for a real app would use a proper MD library)
    return content.split("\n").map((line, i) => {
      if (line.startsWith("- ")) {
        return (
          <li key={i} className="ml-4 mb-2">
            {renderInlineCode(line.substring(2))}
          </li>
        );
      } else if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ")) {
        return (
          <li key={i} className="ml-4 list-decimal mb-2">
            {renderInlineCode(line.substring(3))}
          </li>
        );
      } else if (line === "") {
        return <br key={i} />;
      } else {
        return <p key={i} className="mb-4">{renderInlineCode(line)}</p>;
      }
    });
  };

  const renderInlineCode = (text: string) => {
    const parts = text.split("`");
    return parts.map((part, i) => {
      // Every odd index is code
      if (i % 2 === 1) {
        return (
          <code
            key={i}
            className="bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded code-font text-sm"
          >
            {part}
          </code>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold mb-1">{currentStep.title}</h1>
        <p className="text-sm text-muted-foreground">
          {assignment.title}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {renderContent(currentStep.learningText || "")}
        </div>

        {currentStep.codeTemplate && (
          <Card className="relative overflow-hidden">
            <div className="absolute top-2 right-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={copyExample}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <pre className="bg-editor-background text-editor-foreground p-4 rounded-md code-font text-sm overflow-x-auto">
              <code>{currentStep.codeTemplate}</code>
            </pre>
          </Card>
        )}

        {currentStep.hints && currentStep.hints.length > 0 && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-full justify-start",
                showHint && "border-primary/50"
              )}
              onClick={toggleHint}
            >
              <Lightbulb
                className={cn(
                  "h-4 w-4 mr-2",
                  showHint ? "text-amber-400" : "text-muted-foreground"
                )}
              />
              {showHint ? "Hide Hints" : "Show Hints"}
            </Button>
            {showHint && currentStep.hints && (
              <Card className="p-4 bg-muted/50 border-primary/20 animate-scale-in">
                <ul className="text-sm list-disc pl-5 space-y-2">
                  {currentStep.hints.map((hint, index) => (
                    <li key={index}>{hint}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={isFirstModule}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentStepIndex + 1} / {totalModules}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={isLastModule}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
