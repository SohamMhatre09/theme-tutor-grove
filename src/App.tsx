import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/lib/auth";
import { lazy, Suspense } from "react";

const Classroom = lazy(() => import("./pages/Classroom"));
const ClassroomView = lazy(() => import("./pages/ClassroomView"));
const CreateClassroom = lazy(() => import("./pages/CreateClassroom"));
const Assignment = lazy(() => import("./pages/Assignment"));
const PythonAssignments = lazy(() => import("./pages/PythonAssignments"));
const AssignmentPage = lazy(() => import("./pages/AssignmentPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ChangePasswordPage = lazy(() => import("./pages/ChangePasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));

// Protected route component
const ProtectedRoute = ({ children }) => {
  const authToken = localStorage.getItem("authToken");
  if (!authToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="system">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
              <Routes>
                {/* Auth routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                
                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Classroom />
                  </ProtectedRoute>
                } />
                <Route path="/classroom/:id" element={
                  <ProtectedRoute>
                    <ClassroomView />
                  </ProtectedRoute>
                } />
                <Route path="/create-classroom" element={
                  <ProtectedRoute>
                    <CreateClassroom />
                  </ProtectedRoute>
                } />
                <Route path="/assignment/:id" element={
                  <ProtectedRoute>
                    <Assignment />
                  </ProtectedRoute>
                } />
                <Route path="/python-assignments" element={
                  <ProtectedRoute>
                    <PythonAssignments />
                  </ProtectedRoute>
                } />
                <Route path="/python-assignment/:id" element={
                  <ProtectedRoute>
                    <AssignmentPage />
                  </ProtectedRoute>
                } />
                <Route path="/change-password" element={
                  <ProtectedRoute>
                    <ChangePasswordPage />
                  </ProtectedRoute>
                } />
                
                {/* Redirect for compatibility with current URL */}
                <Route 
                  path="/assignment/prefix-sum-problem" 
                  element={<Navigate to="/python-assignment/prefix-sum-problem" replace />} 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
