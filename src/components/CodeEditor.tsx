import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import { useTheme } from "@/components/ThemeProvider";
import { Play, RotateCcw, Sun, Moon } from "lucide-react";

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
}

export function CodeEditor({ 
  module,
  onSubmit, 
  onRun, 
  isExecuting,
  assignmentName
}: CodeEditorProps) {
  const { theme: systemTheme } = useTheme();
  const [editorTheme, setEditorTheme] = useState<"light" | "vs-dark">(systemTheme === 'dark' ? 'vs-dark' : 'light');
  const [code, setCode] = useState<string>(module.codeTemplate || "");
  
  // Toggle the editor theme
  const toggleEditorTheme = () => {
    setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark');
  };

  useEffect(() => {
    // Update editor theme when system theme changes
    setEditorTheme(systemTheme === 'dark' ? 'vs-dark' : 'light');
  }, [systemTheme]);

  // Reset code when module changes
  useEffect(() => {
    if (module && module.codeTemplate) {
      setCode(module.codeTemplate.replace(/<editable>|<\/editable>/g, ""));
    }
  }, [module.id]);

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
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
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleSubmit} className="ml-auto">Submit Solution</Button>
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
      
      {/* Simple full-height editor with a single scrollbar */}
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
    </div>
  );
}