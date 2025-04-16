import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import { useTheme } from "@/components/ThemeProvider";
import { Play, RotateCcw, Sun, Moon, Lightbulb } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface CodeEditorProps {
  module: {
    id: number;
    title: string;
    codeTemplate: string;
    learningText: string;
    hints: string[];
    expectedOutput: string;
  };
  onSubmit: (code: string, moduleId: number) => void;
  onRun: (code: string, moduleId: number) => void;
  isExecuting: boolean;
  assignmentName?: string;
  code?: string;
  onCodeChange?: (code: string) => void;
  isLastModule?: boolean;
  isCurrentModuleCompleted?: boolean;
  onFinalSubmit?: () => void;
}

export function CodeEditor({ 
  module,
  onSubmit, 
  onRun, 
  isExecuting,
  assignmentName,
  code: externalCode,
  onCodeChange,
  isLastModule = false,
  isCurrentModuleCompleted = false,
  onFinalSubmit
}: CodeEditorProps) {
  const { theme: systemTheme } = useTheme();
  const [editorTheme, setEditorTheme] = useState<"light" | "vs-dark">(systemTheme === 'dark' ? 'vs-dark' : 'light');
  const [code, setCode] = useState<string>(externalCode || module.codeTemplate || "");
  const [hintDialogOpen, setHintDialogOpen] = useState(false);
  const [generatingHint, setGeneratingHint] = useState(false);
  const [aiHint, setAiHint] = useState<string>("");
  const [hintQuery, setHintQuery] = useState<string>("");
  
  // Toggle the editor theme
  const toggleEditorTheme = () => {
    setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark');
  };

  useEffect(() => {
    // Update editor theme when system theme changes
    setEditorTheme(systemTheme === 'dark' ? 'vs-dark' : 'light');
  }, [systemTheme]);

  // Update internal code when external code changes or module changes
  useEffect(() => {
    if (externalCode !== undefined) {
      setCode(externalCode);
    } else if (module && module.codeTemplate) {
      setCode(module.codeTemplate);
    }
  }, [externalCode, module.id]);

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      // Call the parent's onCodeChange handler
      if (onCodeChange) {
        onCodeChange(value);
      }
    }
  };

  const handleSubmit = () => {
    onSubmit(code, module.id);
  };

  const handleRun = async () => {
    await onRun(code, module.id);
  };

  const handleResetCode = () => {
    if (module && module.codeTemplate) {
      setCode(module.codeTemplate.replace(/<editable>|<\/editable>/g, ""));
    }
  };

  const requestAiHint = async () => {
    setGeneratingHint(true);
    try {
      // Construct the prompt for the AI
      const prompt = `
I'm working on a coding assignment with the following requirements:
Title: ${module.title}
Instructions: ${module.learningText}
Expected Output: ${module.expectedOutput}

Here's my current code:
\`\`\`python
${code}
\`\`\`

My specific question is: ${hintQuery}

Please provide a helpful hint that guides me toward the solution without giving me the complete answer. Help me understand the concept and suggest an approach to solve the problem.
`;

      // Call Google's Vertex AI API with Flash 2.0 model
      const response = await fetch("https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/us-central1/publishers/google/models/flash-2p:predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer AIzaSyALtOLJyceA8CBudXp4CT30O1qdbRTJ4Yc` // Use environment variable for token
        },
        body: JSON.stringify({
          instances: [
            { prompt: prompt }  
          ],
          parameters: {
            temperature: 0.3,
            maxOutputTokens: 300,
            topK: 40,
            topP: 0.95
          }
        })
      });

      // Process the response from Google's API
      const result = await response.json();
      const aiResponse = result.predictions[0].content;
      setAiHint(aiResponse);
      setGeneratingHint(false);

    } catch (error) {
      console.error("Error generating hint:", error);
      setAiHint("Sorry, there was an error generating your hint. Please try again.");
      setGeneratingHint(false);
    }
  };

  // Monaco editor options
  const editorOptions = {
    scrollBeyondLastLine: false,
    minimap: { enabled: false },
    fontSize: 14,
    automaticLayout: true,
    wordWrap: "on",
    lineNumbers: "on",
    folding: true,
    bracketPairColorization: { enabled: true },
    padding: { top: 16, bottom: 16 },
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetCode}
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Code
          </Button>
          <Button
            variant="secondary" 
            size="sm"
            onClick={handleRun}
            disabled={isExecuting}
            className="flex items-center gap-1"
          >
            <Play className="h-3.5 w-3.5" /> Run Code
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHintDialogOpen(true)}
            className="flex items-center gap-1 border-amber-400/50 text-amber-500 hover:bg-amber-500/10"
          >
            <Lightbulb className="h-3.5 w-3.5" /> AI Hint
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {isLastModule ? (
            <Button 
              onClick={onFinalSubmit} 
              className="ml-auto"
              disabled={!isCurrentModuleCompleted}
            >
              Submit Assignment
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              className="ml-auto"
            >
              Submit Solution
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleEditorTheme}
            title={editorTheme === 'vs-dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {editorTheme === 'vs-dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Code Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={handleCodeChange}
          options={editorOptions}
          theme={editorTheme}
        />
      </div>
      
      <div className="p-2 border-t bg-muted text-xs text-muted-foreground">
        <kbd className="px-1 py-0.5 bg-muted-foreground/20 rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-muted-foreground/20 rounded">Enter</kbd> to run your code
      </div>

      {/* AI Hint Dialog */}
      <Dialog open={hintDialogOpen} onOpenChange={setHintDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-400" />
              AI Coding Assistant
            </DialogTitle>
            <DialogDescription>
              Ask a specific question about your code and get a hint without revealing the complete solution.
            </DialogDescription>
          </DialogHeader>
          
          {!aiHint ? (
            <>
              <div className="space-y-4 py-4">
                <Textarea 
                  placeholder="What are you stuck on? Be specific about the problem you're facing."
                  value={hintQuery}
                  onChange={(e) => setHintQuery(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={requestAiHint}
                  disabled={!hintQuery.trim() || generatingHint}
                >
                  {generatingHint ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating hint...
                    </>
                  ) : (
                    "Get Hint"
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="bg-muted p-4 rounded-md text-sm">
                  {aiHint}
                </div>
              </div>
              <DialogFooter className="flex flex-row justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAiHint("");
                    setHintQuery("");
                  }}
                >
                  Ask Another Question
                </Button>
                <Button 
                  onClick={() => setHintDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}