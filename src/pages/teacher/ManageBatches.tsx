import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Search, Plus, Users, Copy, BookOpen, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ManageBatches() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [newBatchData, setNewBatchData] = useState({
    name: "",
    description: "",
    schedule: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    // In a real app, this would fetch the teacher's batches from an API
    const fetchTeacherBatches = async () => {
      try {
        // Simulating API call with dummy data for now
        setTimeout(() => {
          setBatches([
            {
              id: "1",
              name: "Web Development Fundamentals",
              description: "HTML, CSS, and JavaScript basics for beginners",
              schedule: "Mon, Wed 4:00-5:30 PM",
              enrollmentCode: "WEB101",
              studentsCount: 15,
              createdAt: new Date().toISOString(),
            },
            {
              id: "2",
              name: "Advanced React",
              description: "Deep dive into React hooks, context, and performance optimization",
              schedule: "Tue, Thu 6:00-7:30 PM",
              enrollmentCode: "REACT201",
              studentsCount: 8,
              createdAt: new Date().toISOString(),
            }
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching batches:", error);
        setIsLoading(false);
      }
    };

    fetchTeacherBatches();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setIsCreatingBatch(true);
    
    try {
      // Simulating API call
      setTimeout(() => {
        const newBatch = {
          id: Date.now().toString(),
          name: newBatchData.name,
          description: newBatchData.description,
          schedule: newBatchData.schedule,
          enrollmentCode: `${newBatchData.name.substring(0, 4).toUpperCase()}${Math.floor(Math.random() * 1000)}`,
          studentsCount: 0,
          createdAt: new Date().toISOString(),
        };
        
        setBatches([newBatch, ...batches]);
        setNewBatchData({ name: "", description: "", schedule: "" });
        setIsDialogOpen(false);
        
        toast({
          title: "Success",
          description: "New batch created successfully!",
        });
        
        setIsCreatingBatch(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create batch. Please try again.",
        variant: "destructive",
      });
      setIsCreatingBatch(false);
    }
  };

  const handleCopyEnrollmentCode = (code) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Enrollment code copied to clipboard",
    });
  };

  const filteredBatches = batches.filter(batch => 
    batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    batch.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Pencil className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">CodeLearn Teacher</span>
          </Link>
          {/* Could add more header elements here */}
        </div>
      </header>

      <main className="container py-8">
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold mb-1">Manage Batches</h1>
            <p className="text-muted-foreground">Create and manage your teaching batches</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create New Batch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Batch</DialogTitle>
                <DialogDescription>
                  Add details for your new teaching batch. Students will use the automatically generated enrollment code to join.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateBatch}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="batchName">Batch Name</Label>
                    <Input 
                      id="batchName" 
                      value={newBatchData.name}
                      onChange={(e) => setNewBatchData({...newBatchData, name: e.target.value})}
                      placeholder="e.g., Web Development Fundamentals"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input 
                      id="description" 
                      value={newBatchData.description}
                      onChange={(e) => setNewBatchData({...newBatchData, description: e.target.value})}
                      placeholder="Brief description of the batch"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="schedule">Schedule (Optional)</Label>
                    <Input 
                      id="schedule" 
                      value={newBatchData.schedule}
                      onChange={(e) => setNewBatchData({...newBatchData, schedule: e.target.value})}
                      placeholder="e.g., Mon, Wed 4:00-5:30 PM"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatingBatch}>
                    {isCreatingBatch ? "Creating..." : "Create Batch"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search batches..."
              className="pl-9 w-full md:max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <AnimatePresence>
          {isLoading ? (
            <motion.div 
              className="flex justify-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Tabs defaultValue="all">
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All Batches</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  {filteredBatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredBatches.map((batch) => (
                        <motion.div
                          key={batch.id}
                          whileHover={{ y: -5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Card className="h-full flex flex-col">
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <CardTitle>{batch.name}</CardTitle>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit Batch</DropdownMenuItem>
                                    <DropdownMenuItem>View Students</DropdownMenuItem>
                                    <DropdownMenuItem>Manage Assignments</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">Archive Batch</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <CardDescription>{batch.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{batch.studentsCount} Students</span>
                                </div>
                                {batch.schedule && (
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{batch.schedule}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                                  <span className="text-sm font-medium">Enrollment Code:</span>
                                  <code className="text-sm bg-background px-1 py-0.5 rounded">
                                    {batch.enrollmentCode}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 ml-auto"
                                    onClick={() => handleCopyEnrollmentCode(batch.enrollmentCode)}
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button asChild variant="outline" className="w-full">
                                <Link to={`/teacher/batches/${batch.id}`}>Manage Batch</Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Users className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No batches found</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        {searchQuery ? "No batches match your search query" : "You haven't created any batches yet"}
                      </p>
                      <Button onClick={() => setIsDialogOpen(true)}>
                        Create Your First Batch
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                {/* Similar content for other tabs */}
                <TabsContent value="active">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Active batches view</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="archived">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Archived batches view</p>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}