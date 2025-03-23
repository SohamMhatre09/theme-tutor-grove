
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RotateCcw, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Step } from "@/lib/assignments";
import { useTheme } from "@/components/ThemeProvider";

interface CodeEditorProps {
  step: Step;
  savedCode: string | null;
  onCodeChange: (code: string) => void;
  onRunCode: (code: string) => void;
  onResetCode: () => void;
}

export function CodeEditor({
  step,
  savedCode,
  onCodeChange,
  onRunCode,
  onResetCode,
}: CodeEditorProps) {
  const { theme } = useTheme();
  const [code, setCode] = useState("");
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);
  
  useEffect(() => {
    // Initialize with saved code or starter code
    const initialCode = savedCode || step.starterCode || "";
    setCode(initialCode);
    
    // Calculate line numbers
    const lineCount = (initialCode.match(/\n/g) || []).length + 1;
    setLineNumbers(Array.from({ length: lineCount }, (_, i) => i + 1));
  }, [step, savedCode]);
  
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onCodeChange(newCode);
    
    // Update line numbers when code changes
    const lineCount = (newCode.match(/\n/g) || []).length + 1;
    setLineNumbers(Array.from({ length: lineCount }, (_, i) => i + 1));
  };
  
  const handleRunCode = () => {
    onRunCode(code);
  };
  
  const handleResetCode = () => {
    const starterCode = step.starterCode || "";
    setCode(starterCode);
    onResetCode();
    
    // Update line numbers
    const lineCount = (starterCode.match(/\n/g) || []).length + 1;
    setLineNumbers(Array.from({ length: lineCount }, (_, i) => i + 1));
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-sm font-medium">Code Editor</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetCode}
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleRunCode}
            className="flex items-center gap-1"
          >
            <Play className="h-3.5 w-3.5" />
            Run Code
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex bg-editor-background text-editor-foreground">
          <div className="p-4 text-right text-muted-foreground border-r border-editor-line select-none">
            {lineNumbers.map((num) => (
              <div key={num} className="leading-6 text-xs code-font">
                {num}
              </div>
            ))}
          </div>
          <Textarea
            value={code}
            onChange={handleCodeChange}
            className={cn(
              "flex-1 rounded-none border-0 resize-none p-4 leading-6 text-sm code-font focus-visible:ring-0 focus-visible:ring-offset-0",
              "bg-editor-background text-editor-foreground h-full"
            )}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
