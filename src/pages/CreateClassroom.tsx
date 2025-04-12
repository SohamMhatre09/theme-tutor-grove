import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserProfile } from "@/components/auth/UserProfile";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { School, ArrowLeft } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(5, {
    message: "Classroom name must be at least 5 characters.",
  }),
  subject: z.string().min(3, {
    message: "Subject must be at least 3 characters.",
  }),
  description: z.string().optional(),
  schedule: z.string().optional(),
});

export default function CreateClassroom() {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: "",
      description: "",
      schedule: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsCreating(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log(values);
      toast({
        title: "Classroom created!",
        description: `"${values.name}" has been created successfully.`,
      });
      navigate("/");
      setIsCreating(false);
    }, 1500);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="container h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <School className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">CodeClassroom</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-muted-foreground animate-hover hover:text-foreground">
                My Classrooms
              </Link>
            </nav>
            <Separator orientation="vertical" className="h-6 hidden md:block" />
            <ThemeToggle />
            <UserProfile />
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link to="/" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classrooms
          </Link>
        </Button>
        
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create a New Classroom</CardTitle>
              <CardDescription>
                Set up a virtual classroom for your students to access assignments and materials.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Classroom Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Introduction to Programming" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the name students will see when joining your classroom.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Computer Science" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="A brief description of what students will learn in this class..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="schedule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schedule (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Mon, Wed, Fri - 10:00 AM to 11:30 AM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={isCreating}>
                      {isCreating ? "Creating Classroom..." : "Create Classroom"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-5">
              <div className="text-sm text-muted-foreground">
                Your classroom will be created instantly and students can join with the code provided.
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <footer className="border-t border-border py-8 mt-12">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <School className="h-5 w-5 text-primary" />
            <span className="font-medium">CodeClassroom</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CodeClassroom. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}