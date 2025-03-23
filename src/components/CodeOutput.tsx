
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Step } from "@/lib/assignments";
import { AlertCircle, CheckCircle, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { markStepCompleted } from "@/lib/assignments";

interface CodeOutputProps {
  assignmentId: string;
  step: Step;
  code: string;
  isRunning: boolean;
}

interface TestResult {
  name: string;
  passed: boolean;
  hint?: string;
}

export function CodeOutput({
  assignmentId,
  step,
  code,
  isRunning,
}: CodeOutputProps) {
  const [output, setOutput] = useState<string>("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (isRunning) {
      runCode(code);
    }
  }, [isRunning, code]);

  // Function to run the code and check tests
  const runCode = (code: string) => {
    setHasRun(true);
    let consoleOutput = "";
    let testResults: TestResult[] = [];
    let allPassed = true;

    // Capture console.log output
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const output = args.map(arg => String(arg)).join(" ");
      consoleOutput += output + "\n";
      originalConsoleLog(...args);
    };

    try {
      // For security reasons, in a real app we would run this in a sandbox
      // Here we're using a simple eval for demonstration
      const scopedEval = (code: string) => {
        // Simple console capture for demonstration
        let result;
        try {
          result = eval(`
            (function() { 
              ${code}
              return { success: true };
            })()
          `);
        } catch (error) {
          consoleOutput += `Error: ${error.message}\n`;
          result = { success: false, error: error.message };
        }
        return result;
      };

      // Run the code
      const result = scopedEval(code);

      // Check if we have tests to run
      if (step.tests && step.tests.length > 0) {
        // Run each test
        testResults = step.tests.map(test => {
          try {
            // Evaluate the test condition
            const testPassed = eval(`
              (function() { 
                ${code}
                return ${test.test};
              })()
            `);
            
            if (!testPassed) {
              allPassed = false;
            }
            
            return {
              name: test.name,
              passed: testPassed,
              hint: !testPassed ? test.hint : undefined
            };
          } catch (error) {
            allPassed = false;
            return {
              name: test.name,
              passed: false,
              hint: `Error: ${error.message}`
            };
          }
        });
      }

      // Mark step as completed if all tests passed
      if (allPassed && step.tests && step.tests.length > 0) {
        markStepCompleted(assignmentId, step.id);
      }
    } catch (error) {
      consoleOutput += `Error: ${error.message}\n`;
      allPassed = false;
    } finally {
      // Restore original console.log
      console.log = originalConsoleLog;
      
      // Update state with results
      setOutput(consoleOutput);
      setTestResults(testResults);
      setAllTestsPassed(allPassed && testResults.length > 0);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="p-4 border-b border-border">
        <div className="flex items-center">
          <Terminal className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Output</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!hasRun && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Terminal className="h-12 w-12 mb-4" />
            <p>Click "Run Code" to see the output</p>
          </div>
        )}

        {hasRun && (
          <>
            {output && (
              <Card className="bg-editor-background text-editor-foreground">
                <pre className="p-4 text-sm code-font overflow-x-auto whitespace-pre-wrap">
                  {output}
                </pre>
              </Card>
            )}

            {testResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Test Results</h3>
                {testResults.map((result, index) => (
                  <Card
                    key={index}
                    className={cn(
                      "p-3 flex items-start gap-3",
                      result.passed
                        ? "bg-primary/5 border-primary/10"
                        : "bg-destructive/5 border-destructive/10"
                    )}
                  >
                    {result.passed ? (
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{result.name}</p>
                      {result.hint && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {result.hint}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}

                {allTestsPassed && (
                  <Card className="p-4 bg-primary/5 border-primary/10 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">All tests passed!</p>
                      <p className="text-sm text-muted-foreground">
                        Great job! You've completed this step.
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
