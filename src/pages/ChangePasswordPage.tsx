import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Code, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border py-4">
        <div className="container flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">CodeLearn</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-1 container max-w-6xl py-12">
        <Button
          variant="ghost"
          size="sm"
          className="mb-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Change Password</h1>
          <p className="text-muted-foreground mt-2">Update your account password</p>
        </div>
        
        <ChangePasswordForm />
      </main>
      
      <footer className="border-t border-border py-6">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CodeLearn. All rights reserved.
        </div>
      </footer>
    </div>
  );
}