import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface TeacherRouteProps {
  children: ReactNode;
}

export function TeacherRoute({ children }: TeacherRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if the user is a teacher
  if (user?.role !== "teacher") {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}