import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";

// Existing pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Assignment = lazy(() => import("./pages/Assignment"));
const PythonAssignments = lazy(() => import("./pages/PythonAssignments"));
const AssignmentPage = lazy(() => import("./pages/AssignmentPage"));

// Auth pages
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
              <Routes>
                {/* Public auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Protected routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                <Route path="/assignment/:id" element={
                  <ProtectedRoute>
                    <Assignment />
                  </ProtectedRoute>
                } />
                
                <Route path="/python-assignment/:id" element={
                  <ProtectedRoute>
                    <AssignmentPage />
                  </ProtectedRoute>
                } />
                
                {/* Semi-protected routes */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/python-assignments" element={<PythonAssignments />} />
                
                {/* Redirect for compatibility with current URL */}
                <Route 
                  path="/assignment/prefix-sum-problem" 
                  element={<Navigate to="/python-assignment/prefix-sum-problem" replace />} 
                />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
