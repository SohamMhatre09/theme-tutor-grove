import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";
import { motion, useScroll, useTransform } from "framer-motion";
import Particles from "react-tsparticles"; // Add this import
import { loadFull } from "tsparticles"; // Make sure this import is here
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
import CountUp from 'react-countup';


const particlesInit = async (engine) => {
  try {
    // Use the correct init method based on tsparticles version
    await loadFull(engine);
  } catch (error) {
    console.error("Error initializing particles:", error);
  }
};

export default function Landing() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activePricingTab, setActivePricingTab] = useState("monthly");

  const handleLogout = async () => {
    await logout();
    // Stay on the landing page after logout
  };

  // Add scrollY hook inside component
  const { scrollYProgress } = useScroll();
  const yPosAnimation = useTransform(scrollYProgress, [0, 1], [0, 500]);

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
        {/* Hero section with immersive video background and particles */}
        <section className="py-24 md:py-32 relative overflow-hidden min-h-[100vh] flex items-center">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video 
              autoPlay 
              muted 
              loop 
              className="absolute w-full h-full object-cover"
              style={{ filter: 'brightness(0.3)' }}
            >
              <source src="/videos/code-background.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/30 to-background/90">
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-radial animate-pulse-slow opacity-20"></div>
            </div>
          </div>
          
          {/* Floating animated code elements */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              {/* Create a simple dot pattern animation */}
              {Array.from({ length: 50 }).map((_, index) => (
                <motion.div
                  key={index}
                  className="absolute h-1 w-1 rounded-full bg-white/30"
                  initial={{ 
                    x: `${Math.random() * 100}%`, 
                    y: `${Math.random() * 100}%` 
                  }}
                  animate={{ 
                    x: [
                      `${Math.random() * 100}%`, 
                      `${Math.random() * 100}%`
                    ],
                    y: [
                      `${Math.random() * 100}%`, 
                      `${Math.random() * 100}%`
                    ],
                  }}
                  transition={{
                    duration: Math.random() * 10 + 10,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear"
                  }}
                />
              ))}
            </motion.div>
          </div>
          
          <div className="container relative z-20">
            <motion.div 
              className="flex flex-col items-center text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <Badge variant="outline" className="mb-4 px-3 py-1 text-sm bg-primary/20 border-primary/30 backdrop-blur-sm animate-pulse-subtle">
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🚀
                  </motion.span>
                  <span className="ml-2">Just Launched - New AI-Powered Features</span>
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-size-200 animate-gradient-x"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
              >
                <motion.span 
                  className="inline-block"
                  whileHover={{ 
                    scale: 1.05, 
                    color: "#ffffff", 
                    transition: { duration: 0.2 } 
                  }}
                >
                  Master
                </motion.span>{" "}
                <motion.span 
                  className="inline-block"
                  whileHover={{ 
                    scale: 1.05, 
                    color: "#ffffff", 
                    transition: { duration: 0.2 } 
                  }}
                >
                  Coding
                </motion.span>{" "}
                <motion.span 
                  className="inline-block"
                  whileHover={{ 
                    scale: 1.05, 
                    color: "#ffffff", 
                    transition: { duration: 0.2 } 
                  }}
                >
                  Skills
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-muted-foreground mb-8 max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.7 }}
              >
                A modern platform for learning programming through hands-on practice, AI-guided feedback, and real-world projects.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                {isAuthenticated ? (
                  <Button size="lg" className="gap-2 px-8 bg-gradient-to-r from-primary to-accent hover:shadow-glow transition-all duration-300" asChild>
                    <Link to="/dashboard">
                      <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Go to Dashboard 
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                        </motion.div>
                      </motion.div>
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" className="gap-2 px-8 bg-gradient-to-r from-primary to-accent hover:shadow-glow transition-all duration-300" asChild>
                    <Link to="/register">
                      <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Get Started 
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      </motion.div>
                    </Link>
                  </Button>
                )}
                <Button size="lg" variant="outline" className="gap-2 backdrop-blur-sm bg-background/30 hover:bg-background/50 transition-all duration-300 border-primary/30 hover:border-primary">
                  <motion.div 
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <BookOpen className="h-4 w-4" />
                    View Curriculum
                  </motion.div>
                </Button>
              </motion.div>
              
              {/* Animated stats counters */}
              <motion.div 
                className="mt-16 grid grid-cols-3 gap-4 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.7 }}
              >
                <motion.div 
                  className="bg-background/10 backdrop-blur-md p-4 rounded-lg border border-primary/20 flex flex-col items-center hover:border-primary/50 transition-all duration-300"
                  whileHover={{ 
                    y: -10, 
                    backgroundColor: "rgba(var(--primary), 0.2)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.h3 
                    className="text-4xl font-bold text-primary"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4, duration: 0.5 }}
                  >
                    <CountUp end={100} suffix="+" duration={2.5} />
                  </motion.h3>
                  <p className="text-sm">Interactive Courses</p>
                </motion.div>
                
                <motion.div 
                  className="bg-background/10 backdrop-blur-md p-4 rounded-lg border border-primary/20 flex flex-col items-center hover:border-primary/50 transition-all duration-300"
                  whileHover={{ 
                    y: -10, 
                    backgroundColor: "rgba(var(--primary), 0.2)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.h3 
                    className="text-4xl font-bold text-primary"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.6, duration: 0.5 }}
                  >
                    <CountUp end={10} suffix="k+" duration={2} />
                  </motion.h3>
                  <p className="text-sm">Active Students</p>
                </motion.div>
                
                <motion.div 
                  className="bg-background/10 backdrop-blur-md p-4 rounded-lg border border-primary/20 flex flex-col items-center hover:border-primary/50 transition-all duration-300"
                  whileHover={{ 
                    y: -10, 
                    backgroundColor: "rgba(var(--primary), 0.2)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.h3 
                    className="text-4xl font-bold text-primary"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.8, duration: 0.5 }}
                  >
                    <CountUp end={98} suffix="%" duration={3} />
                  </motion.h3>
                  <p className="text-sm">Success Rate</p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Floating code snippets */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="absolute text-primary/10 font-mono text-sm"
              initial={{ opacity: 0, x: -100, y: 100 }}
              animate={{ opacity: 0.4, x: 0, y: 0 }}
              transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
              style={{ top: '30%', left: '10%' }}
            >
              {`function learnToCode() {`}<br/>
              {`  const skills = [];`}<br/>
              {`  while(motivation) {`}<br/>
              {`    skills.push(newSkill);`}<br/>
              {`    practice++;`}<br/>
              {`  }`}<br/>
              {`  return success;`}<br/>
              {`}`}
            </motion.div>
            
            <motion.div
              className="absolute text-primary/10 font-mono text-sm"
              initial={{ opacity: 0, x: 100, y: -100 }}
              animate={{ opacity: 0.4, x: 0, y: 0 }}
              transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
              style={{ top: '20%', right: '10%' }}
            >
              {`const future = {`}<br/>
              {`  career: "developer",`}<br/>
              {`  skills: ["react", "node", "python"],`}<br/>
              {`  opportunities: "unlimited"`}<br/>
              {`};`}
            </motion.div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
        </section>

        {/* Features section */}
        <section id="features" className="py-24 bg-muted/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
          
          {/* Floating animated elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              className="absolute w-64 h-64 rounded-full bg-primary/10 blur-3xl"
              animate={{ 
                x: [0, 100, 0], 
                y: [0, 50, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 20,
                ease: "easeInOut" 
              }}
              style={{ top: '20%', left: '10%' }}
            />
            <motion.div 
              className="absolute w-96 h-96 rounded-full bg-accent/10 blur-3xl"
              animate={{ 
                x: [0, -70, 0], 
                y: [0, 100, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 25,
                ease: "easeInOut" 
              }}
              style={{ top: '50%', right: '5%' }}
            />
          </div>
          
          <div className="container relative">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl font-bold mb-4">Why Choose CodeLearn</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform combines interactive learning, real-time feedback, and industry-relevant projects to help you master coding skills.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <Card className="bg-card border-primary/10 hover:border-primary/30 transition-all h-full">
                  <CardHeader>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Laptop className="h-10 w-10 text-primary mb-4" />
                    </motion.div>
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
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <Card className="bg-card border-primary/10 hover:border-primary/30 transition-all h-full">
                  <CardHeader>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Sparkles className="h-10 w-10 text-primary mb-4" />
                    </motion.div>
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
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <Card className="bg-card border-primary/10 hover:border-primary/30 transition-all h-full">
                  <CardHeader>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <GraduationCap className="h-10 w-10 text-primary mb-4" />
                    </motion.div>
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
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing section */}
        <section id="pricing" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
          
          <div className="container relative">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that's right for you and start your coding journey today.
              </p>
              
              <motion.div 
                className="flex justify-center mt-8"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
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
              </motion.div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free plan */}
              <Card className="border-primary/10 hover:border-primary/30 transition-all">
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>For beginners exploring coding</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">₹ 0</span>
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
                      ₹ {activePricingTab === "monthly" ? "199" : "159"}
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
                      ₹ {activePricingTab === "monthly" ? "99" : "79"}
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

        {/* Testimonials section with floating cards */}
        <section id="testimonials" className="py-24 bg-muted/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          <div className="container relative">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl font-bold mb-4">What Our Students Say</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join thousands of learners who have transformed their careers with CodeLearn.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ 
                  y: -10,
                  rotate: [-1, 1, 0],
                  transition: { duration: 0.3 }
                }}
              >
                <Card className="bg-card border-primary/10 h-full relative overflow-hidden">
                  <motion.div
                    className="absolute -left-10 -bottom-10 w-20 h-20 rounded-full bg-primary/10 blur-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                  <CardContent className="pt-6">
                    <motion.div 
                      className="flex items-center gap-2 mb-2"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3 }}
                    >
                      {[1, 2, 3, 4, 5].map((star, index) => (
                        <motion.div
                          key={star}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.2, delay: index * 0.1 }}
                        >
                          <Sparkles className="h-4 w-4 fill-primary text-primary" />
                        </motion.div>
                      ))}
                    </motion.div>
                    <p className="italic mb-6">
                      "CodeLearn helped me transition from a non-technical role to a full-stack developer in just 6 months. The interactive lessons made a huge difference!"
                    </p>
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium"
                        whileHover={{ 
                          scale: 1.1, 
                          backgroundColor: "rgba(var(--primary), 0.3)" 
                        }}
                      >
                        JD
                      </motion.div>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-muted-foreground">Software Engineer @ Tech Co</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Add similar animations to other testimonials */}
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
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite;
        }
        
        @keyframes pulse-subtle {
          0% {
            box-shadow: 0 0 0 0 rgba(var(--primary), 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(var(--primary), 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(var(--primary), 0);
          }
        }
        
        .animate-hover {
          transition: all 0.3s ease;
        }
        
        .animate-hover:hover {
          transform: translateY(-2px);
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  );
}