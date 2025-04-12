import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Assignment = lazy(() => import("./pages/Assignment"));
const PythonAssignments = lazy(() => import("./pages/PythonAssignments"));
const AssignmentPage = lazy(() => import("./pages/AssignmentPage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assignment/:id" element={<Assignment />} />
            <Route path="/python-assignments" element={<PythonAssignments />} />
            <Route path="/python-assignment/:id" element={<AssignmentPage />} />
            
            {/* Redirect for compatibility with current URL */}
            <Route 
              path="/assignment/prefix-sum-problem" 
              element={<Navigate to="/python-assignment/prefix-sum-problem" replace />} 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
