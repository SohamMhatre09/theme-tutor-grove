import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TeacherRoute } from "@/components/TeacherRoute";
import { StudentRoute } from "@/components/StudentRoute";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";

// Landing page
const Landing = lazy(() => import("./pages/Landing"));

// Existing pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Assignment = lazy(() => import("./pages/Assignment"));
const BatchDetails = lazy(() => import("./pages/BatchDetails"));

// Auth pages
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));

// Add teacher-specific pages (these will be created later)
const TeacherDashboard = lazy(() => import("./pages/teacher/Dashboard"));
const ClassroomManagement = lazy(() => import("./pages/teacher/ClassroomManagement"));
const ClassroomDetails = lazy(() => import("./pages/teacher/ClassroomDetails"));
const CreateAssignment = lazy(() => import("./pages/teacher/CreateAssignment"));
const AssignmentManagement = lazy(() => import("./pages/teacher/AssignmentManagement"));
const EditAssignment = lazy(() => import("./pages/teacher/EditAssignment"));
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
                {/* Public routes accessible to all */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Student routes */}
                <Route path="/dashboard" element={
                  <StudentRoute>
                    <Dashboard />
                  </StudentRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/assignments/:id" element={
                  <StudentRoute>
                    <Assignment />
                  </StudentRoute>
                } />
                <Route path="/batches/:batchId" element={
                  <StudentRoute>
                    <BatchDetails />
                  </StudentRoute>
                } />
                
                {/* Teacher-specific routes */}
                <Route path="/teacher/dashboard" element={
                  <TeacherRoute>
                    <TeacherDashboard />
                  </TeacherRoute>
                } />
                
                {/* Classroom management routes */}
                <Route path="/teacher/classrooms" element={
                  <TeacherRoute>
                    <ClassroomManagement />
                  </TeacherRoute>
                } />
                <Route path="/teacher/classrooms/:classroomId" element={
                  <TeacherRoute>
                    <ClassroomDetails />
                  </TeacherRoute>
                } />
                <Route path="/teacher/assignments/create" element={
                  <TeacherRoute>
                    <CreateAssignment />
                  </TeacherRoute>
                } />
                
                {/* Assignment management routes */}
                <Route path="/teacher/assignments/:assignmentId" element={
                  <TeacherRoute>
                    <AssignmentManagement />
                  </TeacherRoute>
                } />
                <Route path="/teacher/assignments/:assignmentId/edit" element={
                  <TeacherRoute>
                    <EditAssignment />
                  </TeacherRoute>
                } />
                
                {/* Catch-all route */}
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
