import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Editor from "@monaco-editor/react";
import { useTheme } from "@/components/ThemeProvider";
import { Play, RotateCcw, Sun, Moon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CodeEditorProps {
  code: string;
  onSubmit: (code: string) => void;
}

export function CodeEditor({ code, onSubmit }: CodeEditorProps) {
  const { theme: systemTheme, setTheme: setSystemTheme } = useTheme();
  const [editorTheme, setEditorTheme] = useState<"light" | "vs-dark">(systemTheme === 'dark' ? 'vs-dark' : 'light');
  const [fullCode, setFullCode] = useState<string>(code);
  const [editableParts, setEditableParts] = useState<{ [key: number]: string }>({});
  const [sections, setSections] = useState<{ text: string; editable: boolean; index?: number; startLineNumber: number }[]>([]);
  const editorRefs = useRef<{ [key: string]: any }>({});
  const [editorHeights, setEditorHeights] = useState<{ [key: string]: number }>({});
  const [outputTab, setOutputTab] = useState<"output" | "console">("output");
  const [output, setOutput] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  
  // Toggle the editor theme
  const toggleEditorTheme = () => {
    setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark');
  };

  useEffect(() => {
    // Update editor theme when system theme changes
    setEditorTheme(systemTheme === 'dark' ? 'vs-dark' : 'light');
  }, [systemTheme]);

  useEffect(() => {
    if (!code) return;

    // Parse the code to identify editable sections
    const editableRegex = /<editable>([\s\S]*?)<\/editable>/g;
    let match;
    let lastIndex = 0;
    let currentSections: { text: string; editable: boolean; index?: number; startLineNumber: number }[] = [];
    let currentEditableParts: { [key: number]: string } = {};
    let editableIndex = 0;
    let lineCounter = 1;
    
    // Create sections by splitting on editable tags
    while ((match = editableRegex.exec(code)) !== null) {
      // Add non-editable section before the match
      if (match.index > lastIndex) {
        const textBefore = code.substring(lastIndex, match.index);
        // Count lines in the non-editable section
        const linesBefore = (textBefore.match(/\n/g) || []).length;
        
        currentSections.push({
          text: textBefore,
          editable: false,
          startLineNumber: lineCounter
        });
        
        lineCounter += linesBefore;
      }
      
      // Add editable section
      const editableContent = match[1];
      currentEditableParts[editableIndex] = editableContent;
      
      // Count lines in the editable section
      const linesInEditable = (editableContent.match(/\n/g) || []).length;
      
      currentSections.push({
        text: editableContent,
        editable: true,
        index: editableIndex,
        startLineNumber: lineCounter
      });
      
      lineCounter += linesInEditable + 1; // +1 for the last line
      
      lastIndex = match.index + match[0].length;
      editableIndex++;
    }
    
    // Add remaining non-editable part
    if (lastIndex < code.length) {
      currentSections.push({
        text: code.substring(lastIndex),
        editable: false,
        startLineNumber: lineCounter
      });
    }
    
    setSections(currentSections);
    setEditableParts(currentEditableParts);
  }, [code]);

  // Calculate editor height based on content
  const calculateEditorHeight = (content: string, isEditable: boolean): number => {
    const lineCount = content.split('\n').length;
    // Set a minimum height for editable sections
    const minHeight = isEditable ? 150 : 20;
    // Each line is roughly 20px in height
    return Math.max(minHeight, lineCount * 20);
  };

  // Update editor heights when content changes
  useEffect(() => {
    const newHeights: { [key: string]: number } = {};
    
    // Recalculate line numbers when content changes
    let currentLineNumber = 1;
    const updatedSections = sections.map((section, idx) => {
      const content = section.editable && section.index !== undefined 
        ? editableParts[section.index] 
        : section.text;
        
      newHeights[`section-${idx}`] = calculateEditorHeight(content, section.editable);
      
      // Update the starting line number for this section
      const updatedSection = {
        ...section,
        startLineNumber: currentLineNumber
      };
      
      // Add the number of lines in this section to the counter
      const lineCount = content.split('\n').length;
      currentLineNumber += lineCount;
      
      return updatedSection;
    });
    
    setEditorHeights(newHeights);
    
    // Only update sections if line numbers have changed
    const lineNumbersChanged = updatedSections.some(
      (section, idx) => section.startLineNumber !== sections[idx].startLineNumber
    );
    
    if (lineNumbersChanged) {
      setSections(updatedSections);
    }
  }, [sections, editableParts]);

  const handleEditableChange = (value: string, index: number) => {
    const updatedParts = { ...editableParts };
    updatedParts[index] = value;
    setEditableParts(updatedParts);
    
    // Update height for this specific editor
    sections.forEach((section, idx) => {
      if (section.editable && section.index === index) {
        const newHeights = { ...editorHeights };
        newHeights[`section-${idx}`] = calculateEditorHeight(value, true);
        setEditorHeights(newHeights);
      }
    });
  };

  const handleSubmit = () => {
    // Reconstruct full code from the editable and non-editable parts
    let finalCode = "";
    sections.forEach(section => {
      if (section.editable && section.index !== undefined) {
        // Preserve the original indentation but remove any extra leading/trailing whitespace
        const trimmedContent = editableParts[section.index].trim();
        finalCode += trimmedContent;
      } else {
        finalCode += section.text;
      }
    });
    
    // Remove editable tags before submitting
    finalCode = finalCode.replace(/<editable>|<\/editable>/g, "");
    
    // Check if onSubmit is a function before calling it
    if (typeof onSubmit === 'function') {
      onSubmit(finalCode);
    } else {
      console.error("onSubmit is not a function:", onSubmit);
    }
  };

  const getCurrentCode = () => {
    let finalCode = "";
    sections.forEach(section => {
      if (section.editable && section.index !== undefined) {
        // Preserve the original indentation but remove any extra leading/trailing whitespace
        const trimmedContent = editableParts[section.index].trim();
        finalCode += trimmedContent;
      } else {
        finalCode += section.text;
      }
    });
    return finalCode.replace(/<editable>|<\/editable>/g, "");
  };

  const handleRun = async () => {
    setIsExecuting(true);
    setOutput("Running code...");
    setOutputTab("output");
    
    try {
      const finalCode = getCurrentCode();
      
      // Execute the code via the API
      const response = await fetch("http://localhost:8081/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          language: "python", 
          code: finalCode 
        }),
      });
      
      const data = await response.json();
      
      // Format the output nicely
      let formattedOutput = "";
      
      if (data.stdout) {
        formattedOutput += data.stdout;
      }
      
      if (data.stderr) {
        formattedOutput += "\n\n" + data.stderr;
      }
      
      setOutput(formattedOutput || "No output");
    } catch (error) {
      console.error("Error executing code:", error);
      setOutput(`Error executing code: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleResetEditableParts = () => {
    const newEditableParts: { [key: number]: string } = {};
    
    // Extract original editable content from the code
    const editableRegex = /<editable>([\s\S]*?)<\/editable>/g;
    let match;
    let editableIndex = 0;
    
    while ((match = editableRegex.exec(code)) !== null) {
      newEditableParts[editableIndex] = match[1];
      editableIndex++;
    }
    
    setEditableParts(newEditableParts);
    
    // Update heights after reset
    setTimeout(() => {
      const newHeights: { [key: string]: number } = {};
      
      sections.forEach((section, idx) => {
        if (section.editable && section.index !== undefined) {
          const content = newEditableParts[section.index];
          newHeights[`section-${idx}`] = calculateEditorHeight(content, true);
        } else {
          newHeights[`section-${idx}`] = editorHeights[`section-${idx}`] || calculateEditorHeight(section.text, false);
        }
      });
      
      setEditorHeights(newHeights);
    }, 0);
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
    matchBrackets: "always",
    autoIndent: "full",
    formatOnPaste: true,
    formatOnType: true,
    tabSize: 4,
    detectIndentation: true,
    largeFileOptimizations: false,
    suggest: {
      snippetsPreventQuickSuggestions: false,
      localityBonus: true, 
      shareSuggestSelections: true,
      showKeywords: true,
      showClasses: true,
      showFunctions: true,
      showVariables: true,
      showMethods: true,
    },
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true
    },
    parameterHints: { enabled: true },
    acceptSuggestionOnEnter: "on",
    tabCompletion: "on",
    selectionHighlight: true,
    occurrencesHighlight: true,
  };

  // Function to handle editor mount
  const handleEditorDidMount = (editor: any, monaco: any, sectionIdx: number) => {
    // Save editor reference
    editorRefs.current[`section-${sectionIdx}`] = editor;
    
    const section = sections[sectionIdx];
    const content = section.editable && section.index !== undefined 
      ? editableParts[section.index] 
      : section.text;
      
    // Update height based on content
    const newHeights = { ...editorHeights };
    newHeights[`section-${sectionIdx}`] = calculateEditorHeight(content, section.editable);
    setEditorHeights(newHeights);
    
    // Only set up enhanced features for editable sections
    if (section.editable) {
      // Set up Python language configuration for better auto-completion
      monaco.languages.setLanguageConfiguration('python', {
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"', notIn: ['string'] },
          { open: "'", close: "'", notIn: ['string', 'comment'] },
          { open: '`', close: '`', notIn: ['string'] },
          { open: "'''", close: "'''", notIn: ['string', 'comment'] },
          { open: '"""', close: '"""', notIn: ['string'] },
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
          { open: '`', close: '`' },
        ],
        onEnterRules: [
          {
            beforeText: /^\s*(?:def|class|for|if|elif|else|while|try|with|finally|except|async).*?:\s*$/,
            action: { indentAction: monaco.languages.IndentAction.Indent }
          }
        ],
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')'],
        ],
        comments: {
          lineComment: '#',
        },
        indentationRules: {
          increaseIndentPattern: new RegExp('^\\s*(?:def|class|for|if|elif|else|while|try|with|finally|except|async).*?:\\s*$'),
          decreaseIndentPattern: new RegExp('^\\s*(elif|else|except|finally)\\b.*:\\s*$'),
        },
      });

      // Add some Python snippets
      monaco.languages.registerCompletionItemProvider('python', {
        provideCompletionItems: (model: any, position: any) => {
          const suggestions = [
            {
              label: 'for',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'for ${1:item} in ${2:items}:\n\t${0:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'For Loop'
            },
            {
              label: 'if',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'if ${1:condition}:\n\t${0:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'If Statement'
            },
            {
              label: 'ifelse',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'if ${1:condition}:\n\t${2:pass}\nelse:\n\t${0:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'If-Else Statement'
            },
            {
              label: 'def',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'def ${1:function_name}(${2:parameters}):\n\t${0:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Function Definition'
            },
            {
              label: 'while',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'while ${1:condition}:\n\t${0:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'While Loop'
            }
          ];
          
          return { suggestions };
        }
      });

      // Add keyboard shortcut for executing code (Ctrl+Enter)
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        handleRun();
      });

      // Handle content changes for dynamic resizing
      editor.onDidChangeModelContent(() => {
        const content = editor.getValue();
        const newHeight = calculateEditorHeight(content, true);
        
        // Update height if changed
        if (newHeight !== editorHeights[`section-${sectionIdx}`]) {
          const newHeights = { ...editorHeights };
          newHeights[`section-${sectionIdx}`] = newHeight;
          setEditorHeights(newHeights);
        }
      });
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Prefix Sum Problem</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleEditorTheme}
              title={editorTheme === 'vs-dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {editorTheme === 'vs-dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="font-mono text-sm bg-muted overflow-hidden rounded-md">
            {sections.map((section, idx) => (
              <div key={idx} className={`${section.editable ? 'border-l-4 border-primary' : ''}`}>
                {section.editable ? (
                  <div className="bg-background relative">
                    <Editor
                      height={`${editorHeights[`section-${idx}`] || 180}px`}
                      defaultLanguage="python"
                      value={section.index !== undefined ? editableParts[section.index] : ""}
                      onChange={(value) => section.index !== undefined && handleEditableChange(value || "", section.index)}
                      options={{
                        ...editorOptions,
                        readOnly: false,
                        domReadOnly: false,
                        padding: { top: 8, bottom: 8 },
                        lineNumbersMinChars: 3,
                        lineNumbers: (lineNumber) => {
                          return String(lineNumber + section.startLineNumber - 1);
                        }
                      }}
                      onMount={(editor, monaco) => handleEditorDidMount(editor, monaco, idx)}
                      theme={editorTheme}
                      className="w-full"
                    />
                  </div>
                ) : (
                  <div className="bg-muted text-muted-foreground">
                    <Editor
                      height={`${editorHeights[`section-${idx}`] || Math.max(100, section.text.split('\n').length * 20)}px`}
                      defaultLanguage="python"
                      value={section.text}
                      options={{
                        ...editorOptions,
                        readOnly: true,
                        domReadOnly: true,
                        renderLineHighlight: 'none',
                        lineDecorationsWidth: 0,
                        lineNumbersMinChars: 3,
                        padding: { top: 8, bottom: 8 },
                        scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                        lineNumbers: (lineNumber) => {
                          return String(lineNumber + section.startLineNumber - 1);
                        }
                      }}
                      onMount={(editor, monaco) => handleEditorDidMount(editor, monaco, idx)}
                      theme={editorTheme}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            <kbd className="px-1 py-0.5 bg-muted-foreground/20 rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-muted-foreground/20 rounded">Enter</kbd> to run your code
          </div>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetEditableParts}
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
          <Button onClick={handleSubmit} className="ml-auto">Submit</Button>
        </CardFooter>
      </Card>

      <Card className="w-full">
        <Tabs defaultValue="output" value={outputTab} onValueChange={(value) => setOutputTab(value as "output" | "console")}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Output</CardTitle>
              <TabsList className="grid w-[180px] grid-cols-2">
                <TabsTrigger value="output">Output</TabsTrigger>
                <TabsTrigger value="console">Console</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <TabsContent value="output" className="m-0">
              <div className="h-[200px] p-4 font-mono text-sm overflow-auto">
                {isExecuting ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                    <span>Running...</span>
                  </div>
                ) : output ? (
                  <pre className="whitespace-pre-wrap">{output}</pre>
                ) : (
                  <div className="text-muted-foreground text-center p-8">
                    Run your code to see the output here
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="console" className="m-0">
              <div className="h-[200px] p-4 font-mono text-sm overflow-auto">
                <div className="text-muted-foreground text-center p-8">
                  Console logs will appear here
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
