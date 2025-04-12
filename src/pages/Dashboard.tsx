import { useState } from "react";
import { Link } from "react-router-dom";
import { AssignmentList } from "@/components/AssignmentList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Code, Layers, BookOpen, User, ArrowRight } from "lucide-react";
import { AuthNav } from "@/components/AuthNav";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="container h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">CodeLearn</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium animate-hover hover:text-primary">
                Dashboard
              </Link>
              <Link to="/python-assignments" className="text-sm font-medium text-muted-foreground animate-hover hover:text-foreground">
                Python Assignments
              </Link>
              <Link to="/courses" className="text-sm font-medium text-muted-foreground animate-hover hover:text-foreground">
                Courses
              </Link>
              <Link to="/progress" className="text-sm font-medium text-muted-foreground animate-hover hover:text-foreground">
                My Progress
              </Link>
            </nav>
            <Separator orientation="vertical" className="h-6 hidden md:block" />
            <ThemeToggle />
            <AuthNav /> {/* Replace the User button with AuthNav */}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-primary/5 dark:bg-primary/10 py-12 border-b border-border">
          <div className="container">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Continue your learning journey
              </h1>
              <p className="text-xl text-muted-foreground">
                Master coding with hands-on practice through interactive lessons and exercises
              </p>
            </div>
          </div>
        </section>

        <section className="container py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">Browse Assignments</h2>
            <Button asChild variant="outline" size="sm" className="gap-1">
              <Link to="/python-assignments">
                View Python Assignments
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <AssignmentList />
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <span className="font-medium">CodeLearn</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CodeLearn. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
