import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import { useTheme } from "@/components/ThemeProvider";
import { Play, RotateCcw, Sun, Moon } from "lucide-react";

interface ModuleCode {
  moduleId: number;
  code: string;
}

// Update the CodeEditorProps interface to match your module structure
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
  const [code, setCode] = useState<string>(module.codeTemplate);
  const [editableParts, setEditableParts] = useState<{ [key: number]: string }>({});
  const [sections, setSections] = useState<{ 
    text: string; 
    editable: boolean; 
    index?: number; 
    startLineNumber: number;
  }[]>([]);
  const editorRefs = useRef<{ [key: string]: any }>({});
  const [editorHeights, setEditorHeights] = useState<{ [key: string]: number }>({});
  
  // Toggle the editor theme
  const toggleEditorTheme = () => {
    setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark');
  };

  useEffect(() => {
    // Update editor theme when system theme changes
    setEditorTheme(systemTheme === 'dark' ? 'vs-dark' : 'light');
  }, [systemTheme]);

  // Process code when module changes
  useEffect(() => {
    if (!module || !module.codeTemplate) return;
    
    // Reset everything when module changes
    setCode(module.codeTemplate);
    setEditableParts({});
    setSections([]);
    setEditorHeights({});
  }, [module.id]); // Only run when module.id changes, not the whole module object

  // Parse editable sections when code changes
  useEffect(() => {
    if (!code) return;

    // Parse the code to identify editable sections
    const editableRegex = /<editable>([\s\S]*?)<\/editable>/g;
    let match;
    let lastIndex = 0;
    let currentSections: { 
      text: string; 
      editable: boolean; 
      index?: number; 
      startLineNumber: number;
    }[] = [];
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
    const finalCode = getCurrentCode();
    onSubmit(finalCode, module.id);
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
    const finalCode = getCurrentCode();
    await onRun(finalCode, module.id);
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
    wordWrap: "on" as "on" | "off" | "wordWrapColumn" | "bounded",
    lineNumbers: "on" as "on" | "off" | "relative",
    folding: true,
    bracketPairColorization: { enabled: true },
    matchBrackets: "always" as "always" | "never" | "near",
    autoIndent: "full" as "full" | "none" | "keep" | "brackets" | "advanced",
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
    acceptSuggestionOnEnter: "on" as "on" | "off" | "smart",
    tabCompletion: "on" as "on" | "off" | "onlySnippets",
    selectionHighlight: true,
    occurrencesHighlight: "singleFile" as "off" | "singleFile" | "multiFile",
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
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
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
      
      {/* Fix: Remove the nested scrolling containers that are causing double scrollbars */}
      <div className="flex-1 relative">
        {/* Change this container to not have its own scrollbar */}
        <div className="font-mono text-sm bg-muted w-full absolute inset-0 overflow-auto">
          {sections.map((section, idx) => (
            <div 
              key={idx} 
              className={`${section.editable ? 'border-l-4 border-primary' : ''}`}
            >
              {section.editable ? (
                <div className="bg-background">
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
                      // Adjust scrollbar settings to prevent nested scrollbars
                      scrollbar: { vertical: 'visible', horizontal: 'visible' },
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
                      // Adjust scrollbar settings to prevent nested scrollbars
                      scrollbar: { vertical: 'visible', horizontal: 'visible' },
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
      </div>
      
      <div className="p-2 border-t bg-muted text-xs text-muted-foreground">
        <kbd className="px-1 py-0.5 bg-muted-foreground/20 rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-muted-foreground/20 rounded">Enter</kbd> to run your code
      </div>
    </div>
  );
}