import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";
import { 
  Code, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Laptop, 
  GraduationCap, 
  Users,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activePricingTab, setActivePricingTab] = useState("monthly");

  const handleLogout = async () => {
    await logout();
    // Stay on the landing page after logout
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sticky header with animated gradient */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">CodeLearn</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium text-muted-foreground animate-hover hover:text-foreground">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground animate-hover hover:text-foreground">
                Pricing
              </a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground animate-hover hover:text-foreground">
                Testimonials
              </a>
            </nav>
            <Separator orientation="vertical" className="h-6 hidden md:block" />
            <ThemeToggle />
            
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/register">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero section */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
          <div className="container relative">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <Badge variant="outline" className="mb-4 px-3 py-1 text-sm bg-primary/5 border-primary/20">
                Just Launched 🚀 New AI-Powered Features
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Master Coding Skills with Interactive Lessons
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                A modern platform for learning programming through hands-on practice, AI-guided feedback, and real-world projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {isAuthenticated ? (
                  <Button size="lg" className="gap-2 px-8" asChild>
                    <Link to="/dashboard">
                      Go to Dashboard <LayoutDashboard className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" className="gap-2 px-8" asChild>
                    <Link to="/register">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button size="lg" variant="outline" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  View Demo
                </Button>
              </div>
              
              <div className="mt-16 rounded-lg overflow-hidden border shadow-xl bg-card">
                <img 
                  src="https://placehold.co/1200x675/2b2d42/ffffff?text=CodeLearn+Platform+Preview" 
                  alt="CodeLearn Platform" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="py-24 bg-muted/50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Choose CodeLearn</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform combines interactive learning, real-time feedback, and industry-relevant projects to help you master coding skills.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-card border-primary/10 hover:border-primary/30 transition-all">
                <CardHeader>
                  <Laptop className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Interactive Learning</CardTitle>
                  <CardDescription>
                    Practice coding directly in your browser with our integrated editor.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Live code execution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Real-time feedback</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Step-by-step instructions</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-primary/10 hover:border-primary/30 transition-all">
                <CardHeader>
                  <Sparkles className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>AI-Powered Assistance</CardTitle>
                  <CardDescription>
                    Get personalized help when you're stuck on a problem.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Smart code hints</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Personalized learning path</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Performance analysis</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-primary/10 hover:border-primary/30 transition-all">
                <CardHeader>
                  <GraduationCap className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Structured Curriculum</CardTitle>
                  <CardDescription>
                    Follow a carefully designed path from beginner to expert.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Industry-aligned projects</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Progress tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Skill certifications</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing section */}
        <section id="pricing" className="py-24">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that's right for you and start your coding journey today.
              </p>
              
              <div className="flex justify-center mt-8">
                <Tabs 
                  value={activePricingTab} 
                  onValueChange={setActivePricingTab}
                  className="w-full max-w-xs"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="annual">
                      Annual
                      <Badge variant="secondary" className="ml-2 bg-primary/20 hover:bg-primary/20">
                        Save 20%
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free plan */}
              <Card className="border-primary/10 hover:border-primary/30 transition-all">
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>For beginners exploring coding</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>10 basic assignments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Limited progress tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Community support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  {isAuthenticated ? (
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/dashboard">Go to Dashboard</Link>
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/register">Sign Up for Free</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
              
              {/* Pro plan */}
              <Card className="border-primary relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 -mt-2 -mr-2">
                  <Badge className="bg-primary">Most Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>For serious learners</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">
                      ${activePricingTab === "monthly" ? "29" : "23"}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                    {activePricingTab === "annual" && (
                      <span className="text-xs ml-2 text-primary">Billed annually</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>100+ premium assignments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Full progress tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>AI-powered assistance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Email support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  {isAuthenticated ? (
                    <Button className="w-full" asChild>
                      <Link to="/dashboard">Access Pro Features</Link>
                    </Button>
                  ) : (
                    <Button className="w-full" asChild>
                      <Link to="/register">Get Started</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
              
              {/* Enterprise plan */}
              <Card className="border-primary/10 hover:border-primary/30 transition-all">
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>For teams and organizations</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">
                      ${activePricingTab === "monthly" ? "99" : "79"}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                    {activePricingTab === "annual" && (
                      <span className="text-xs ml-2 text-primary">Billed annually</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>All Pro features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Team management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Custom assignments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Contact Sales
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials section */}
        <section id="testimonials" className="py-24 bg-muted/50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">What Our Students Say</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join thousands of learners who have transformed their careers with CodeLearn.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-card border-primary/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Sparkles key={star} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="italic mb-6">
                    "CodeLearn helped me transition from a non-technical role to a full-stack developer in just 6 months. The interactive lessons made a huge difference!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">JD</div>
                    <div>
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-muted-foreground">Software Engineer @ Tech Co</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-primary/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Sparkles key={star} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="italic mb-6">
                    "The AI-powered feedback is like having a personal tutor. It identifies my mistakes and helps me understand concepts I'm struggling with."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">JS</div>
                    <div>
                      <p className="font-medium">Jane Smith</p>
                      <p className="text-sm text-muted-foreground">Computer Science Student</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-primary/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Sparkles key={star} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="italic mb-6">
                    "As someone returning to coding after years away, CodeLearn's structured approach helped me update my skills and land a new role quickly."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">MJ</div>
                    <div>
                      <p className="font-medium">Michael Johnson</p>
                      <p className="text-sm text-muted-foreground">Senior Developer @ StartupX</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5"></div>
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-4 px-3 py-1 text-sm bg-primary/10 border-primary/20">
                Join 10,000+ developers
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to start your coding journey?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get started today with our free plan or choose a premium option to unlock all features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated ? (
                  <Button size="lg" className="gap-2 px-8" asChild>
                    <Link to="/dashboard">
                      Go to Dashboard <LayoutDashboard className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" className="gap-2 px-8" asChild>
                    <Link to="/register">
                      Start for Free <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button size="lg" variant="outline" className="gap-2" asChild>
                  <a href="#pricing">
                    View Pricing
                  </a>
                </Button>
              </div>
              
              <div className="mt-16 flex items-center justify-center gap-8 flex-wrap">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">10,000+ Active Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">30-Day Money Back</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Regular Updates</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-10 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Code className="h-6 w-6 text-primary" />
                <span className="font-semibold text-lg">CodeLearn</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The modern platform for learning programming through interactive lessons.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Enterprise
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Community
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CodeLearn. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Add a CSS class for grid pattern in your global CSS */}
      <style jsx>{`
        .bg-grid-pattern {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(var(--primary), 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(var(--primary), 0.1) 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
}