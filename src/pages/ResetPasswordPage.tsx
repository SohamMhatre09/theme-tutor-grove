import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { Code } from "lucide-react";

const formSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Extract token from URL query params
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid reset token",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(token, values.password);
      
      setSuccess(true);
      
      toast({
        title: "Success",
        description: "Your password has been reset successfully.",
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // If no token is provided, show an error
  if (!token) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-border">
          <div className="container h-16 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Code className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">CodeLearn</span>
            </Link>
          </div>
        </header>
        
        <main className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Reset Link</h1>
            <p className="text-muted-foreground mb-6">
              The password reset link is invalid or has expired.
            </p>
            <Button asChild>
              <Link to="/forgot-password">Request a new reset link</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="container h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">CodeLearn</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Reset Your Password</h1>
            <p className="text-muted-foreground mt-2">
              Create a new password for your account.
            </p>
          </div>
          
          {success ? (
            <div className="bg-primary/10 p-4 rounded-lg text-center">
              <h2 className="font-medium mb-2">Password Reset Successfully</h2>
              <p className="text-muted-foreground mb-4">
                Your password has been reset. You'll be redirected to the login page in a moment.
              </p>
              <Button asChild variant="outline" className="mt-2">
                <Link to="/login">Go to login</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Resetting Password..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </main>
    </div>
  );
}