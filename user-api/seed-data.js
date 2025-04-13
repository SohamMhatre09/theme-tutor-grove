import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

// Create meta information for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to MongoDB
mongoose.connect("mongodb+srv://user-admin:user-admin@customerservicechat.4uk1s.mongodb.net/?retryWrites=true&w=majority&appName=CustomerServiceChat")
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import Models
// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  }
});

// Class Schema
const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Batch Schema
const batchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  enrollmentCode: { type: String, required: true, unique: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

// Assignment Schema
const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  modules: [{
    id: Number,
    title: String,
    learningText: String,
    codeTemplate: String,
    hints: [String],
    expectedOutput: String
  }],
  createdAt: { type: Date, default: Date.now }
});

// Student Assignment Schema
const studentAssignmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  status: {
    type: String,
    enum: ['assigned', 'in-progress', 'completed'],
    default: 'assigned'
  },
  progress: { type: Number, default: 0 },
  submissions: [{
    moduleId: Number,
    code: String,
    submittedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Class = mongoose.model('Class', classSchema);
const Batch = mongoose.model('Batch', batchSchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);
const StudentAssignment = mongoose.model('StudentAssignment', studentAssignmentSchema);

// Generate a unique enrollment code
const generateEnrollmentCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Sample data
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Class.deleteMany({});
    await Batch.deleteMany({});
    await Assignment.deleteMany({});
    await StudentAssignment.deleteMany({});

    console.log('Existing data cleared');

    // Create teachers
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    
    const teachers = await User.insertMany([
      {
        username: 'prof_alice',
        email: 'alice@example.com',
        password: teacherPassword,
        role: 'teacher'
      },
      {
        username: 'prof_bob',
        email: 'bob@example.com',
        password: teacherPassword,
        role: 'teacher'
      }
    ]);

    console.log('Teachers created:', teachers.map(t => t.username));

    // Create students
    const studentPassword = await bcrypt.hash('student123', 10);
    
    const students = await User.insertMany([
      {
        username: 'student_charlie',
        email: 'charlie@example.com',
        password: studentPassword,
        role: 'student'
      },
      {
        username: 'student_diana',
        email: 'diana@example.com',
        password: studentPassword,
        role: 'student'
      },
      {
        username: 'student_evan',
        email: 'evan@example.com',
        password: studentPassword,
        role: 'student'
      }
    ]);

    console.log('Students created:', students.map(s => s.username));

    // Create classes
    const classes = await Class.insertMany([
      {
        name: 'Introduction to Python',
        subject: 'Programming',
        description: 'Learn the basics of Python programming language',
        teacher: teachers[0]._id
      },
      {
        name: 'Advanced JavaScript',
        subject: 'Web Development',
        description: 'Deep dive into modern JavaScript frameworks and patterns',
        teacher: teachers[0]._id
      },
      {
        name: 'Data Structures',
        subject: 'Computer Science',
        description: 'Fundamental data structures and algorithms',
        teacher: teachers[1]._id
      }
    ]);

    console.log('Classes created:', classes.map(c => c.name));

    // Create batches
    const batches = [];
    for (const classItem of classes) {
      const batch1 = new Batch({
        name: `Morning Batch - ${classItem.name}`,
        class: classItem._id,
        enrollmentCode: generateEnrollmentCode(),
        students: []
      });

      const batch2 = new Batch({
        name: `Evening Batch - ${classItem.name}`,
        class: classItem._id,
        enrollmentCode: generateEnrollmentCode(),
        students: []
      });

      const savedBatch1 = await batch1.save();
      const savedBatch2 = await batch2.save();
      
      batches.push(savedBatch1, savedBatch2);
    }

    console.log('Batches created:', batches.map(b => b.name));
    console.log('Enrollment codes:', batches.map(b => `${b.name}: ${b.enrollmentCode}`));

    // Enroll students in batches
    const batch1 = batches[0];
    const batch2 = batches[1];
    const batch3 = batches[2];

    batch1.students.push(students[0]._id, students[1]._id);
    batch2.students.push(students[1]._id, students[2]._id);
    batch3.students.push(students[0]._id, students[2]._id);

    await batch1.save();
    await batch2.save();
    await batch3.save();

    console.log('Students enrolled in batches');

    // Create assignments
    const pythonAssignment = new Assignment({
      title: "A* Pathfinding Algorithm Implementation",
      description: "This assignment guides you through implementing the A* pathfinding algorithm. You'll start with basic graph representation and progressively build the algorithm, culminating in a working pathfinder.",
      class: classes[0]._id,
      modules: [
        {
          id: 1,
          title: "Module 1: Graph Representation",
          learningText: "Before we can implement A*, we need a way to represent our search space. We'll use a simple graph representation where nodes are locations and edges represent connections between them. Each node will have coordinates (x, y). We'll represent the graph as a dictionary where keys are node names (strings) and values are dictionaries containing 'coordinates' (a tuple) and 'neighbors' (a list of node names).",
          codeTemplate: "import math\n\nclass Graph:\n    def __init__(self):\n        self.nodes = {}\n\n    def add_node(self, name, coordinates):\n        self.nodes[name] = {'coordinates': coordinates, 'neighbors': []}\n\n    def add_edge(self, node1, node2):\n        if node1 in self.nodes and node2 in self.nodes:\n            self.nodes[node1]['neighbors'].append(node2)\n            self.nodes[node2]['neighbors'].append(node1) # Assuming undirected graph\n        else:\n            print(\"Error: One or both nodes do not exist.\")\n\n    def get_neighbors(self, node):\n        if node in self.nodes:\n            return self.nodes[node]['neighbors']\n        else:\n            return None\n\n    def get_coordinates(self, node):\n        if node in self.nodes:\n            return self.nodes[node]['coordinates']\n        else:\n            return None\n\n# Example Usage\ngraph = Graph()\ngraph.add_node('A', (0, 0))\ngraph.add_node('B', (1, 2))\ngraph.add_node('C', (3, 1))\ngraph.add_edge('A', 'B')\ngraph.add_edge('B', 'C')\n\n# Print the graph structure (for debugging)\nprint(graph.nodes)",
          hints: [
            "Make sure the 'neighbors' list is initialized as an empty list when adding a node.",
            "The 'add_edge' function should add the connection in both directions for an undirected graph.",
            "Double-check that the node names used in 'add_edge' exist in the graph."
          ],
          expectedOutput: "{'A': {'coordinates': (0, 0), 'neighbors': ['B']}, 'B': {'coordinates': (1, 2), 'neighbors': ['A', 'C']}, 'C': {'coordinates': (3, 1), 'neighbors': ['B']}}"
        },
        {
          id: 2,
          title: "Module 2: Heuristic Function (Manhattan Distance)",
          learningText: "A* uses a heuristic function to estimate the cost from a given node to the goal. A common heuristic is the Manhattan distance, which calculates the sum of the absolute differences of the x and y coordinates. Implement the `manhattan_distance` function.",
          codeTemplate: "import math\n\nclass Graph:\n    def __init__(self):\n        self.nodes = {}\n\n    def add_node(self, name, coordinates):\n        self.nodes[name] = {'coordinates': coordinates, 'neighbors': []}\n\n    def add_edge(self, node1, node2):\n        if node1 in self.nodes and node2 in self.nodes:\n            self.nodes[node1]['neighbors'].append(node2)\n            self.nodes[node2]['neighbors'].append(node1) # Assuming undirected graph\n        else:\n            print(\"Error: One or both nodes do not exist.\")\n\n    def get_neighbors(self, node):\n        if node in self.nodes:\n            return self.nodes[node]['neighbors']\n        else:\n            return None\n\n    def get_coordinates(self, node):\n        if node in self.nodes:\n            return self.nodes[node]['coordinates']\n        else:\n            return None\n\ndef manhattan_distance(node1_coords, node2_coords):\n    # Calculate the Manhattan distance between two coordinate tuples.\n    x1, y1 = node1_coords\n    x2, y2 = node2_coords\n    return abs(x1 - x2) + abs(y1 - y2)\n\n# Example Usage\nnode1_coords = (0, 0)\nnode2_coords = (3, 4)\ndistance = manhattan_distance(node1_coords, node2_coords)\nprint(f\"Manhattan distance between {node1_coords} and {node2_coords}: {distance}\")",
          hints: [
            "Remember to unpack the coordinate tuples into x and y values.",
            "Use the `abs()` function to calculate the absolute difference.",
            "Return the sum of the absolute differences of the x and y coordinates."
          ],
          expectedOutput: "Manhattan distance between (0, 0) and (3, 4): 7"
        },
        {
          id: 3,
          title: "Module 3: A* Algorithm - Initialization",
          learningText: "Now, let's start implementing the A* algorithm. We'll begin with the initialization step. This involves creating the `open_set`, `closed_set`, `came_from`, `g_score`, and `f_score` data structures. `open_set` holds nodes to be evaluated, `closed_set` holds nodes already evaluated, `came_from` stores the path, `g_score` is the cost from start to the node, and `f_score` is the estimated cost from start to goal through the node.",
          codeTemplate: "import math\n\nclass Graph:\n    def __init__(self):\n        self.nodes = {}\n\n    def add_node(self, name, coordinates):\n        self.nodes[name] = {'coordinates': coordinates, 'neighbors': []}\n\n    def add_edge(self, node1, node2):\n        if node1 in self.nodes and node2 in self.nodes:\n            self.nodes[node1]['neighbors'].append(node2)\n            self.nodes[node2]['neighbors'].append(node1) # Assuming undirected graph\n        else:\n            print(\"Error: One or both nodes do not exist.\")\n\n    def get_neighbors(self, node):\n        if node in self.nodes:\n            return self.nodes[node]['neighbors']\n        else:\n            return None\n\n    def get_coordinates(self, node):\n        if node in self.nodes:\n            return self.nodes[node]['coordinates']\n        else:\n            return None\n\ndef manhattan_distance(node1_coords, node2_coords):\n    x1, y1 = node1_coords\n    x2, y2 = node2_coords\n    return abs(x1 - x2) + abs(y1 - y2)\n\ndef a_star(graph, start, goal):\n    open_set = {start}  # Nodes to be evaluated\n    closed_set = set()   # Nodes already evaluated\n    came_from = {}\n    g_score = {node: float('inf') for node in graph.nodes} # Cost from start to node\n    f_score = {node: float('inf') for node in graph.nodes} # Estimated cost from start to goal through node\n\n    g_score[start] = 0\n    f_score[start] = manhattan_distance(graph.get_coordinates(start), graph.get_coordinates(goal))\n\n    # Return the initialized data structures for testing.\n    return open_set, closed_set, came_from, g_score, f_score\n\n# Example Usage\ngraph = Graph()\ngraph.add_node('A', (0, 0))\ngraph.add_node('B', (1, 2))\ngraph.add_node('C', (3, 1))\ngraph.add_node('D', (4, 4))\ngraph.add_edge('A', 'B')\ngraph.add_edge('B', 'C')\ngraph.add_edge('C', 'D')\n\nstart_node = 'A'\ngoal_node = 'D'\n\nopen_set, closed_set, came_from, g_score, f_score = a_star(graph, start_node, goal_node)\n\nprint(\"Open Set:\", open_set)\nprint(\"Closed Set:\", closed_set)\nprint(\"G Scores:\", g_score)\nprint(\"F Scores:\", f_score)",
          hints: [
            "Initialize `g_score` and `f_score` with infinity for all nodes except the start node.",
            "The `open_set` should initially contain only the start node.",
            "The `closed_set` should initially be empty."
          ],
          expectedOutput: "Open Set: {'A'}\nClosed Set: set()\nG Scores: {'A': 0, 'B': inf, 'C': inf, 'D': inf}\nF Scores: {'A': 8, 'B': inf, 'C': inf, 'D': inf}"
        },
        {
          id: 4,
          title: "Module 4: A* Algorithm - Main Loop",
          learningText: "Now, let's implement the main loop of the A* algorithm. This involves repeatedly selecting the node with the lowest f_score from the open set, checking if it's the goal, and updating the g_score and f_score of its neighbors. We'll focus on the loop structure and neighbor evaluation in this module.",
          codeTemplate: "import math\n\nclass Graph:\n    def __init__(self):\n        self.nodes = {}\n\n    def add_node(self, name, coordinates):\n        self.nodes[name] = {'coordinates': coordinates, 'neighbors': []}\n\n    def add_edge(self, node1, node2):\n        if node1 in self.nodes and node2 in self.nodes:\n            self.nodes[node1]['neighbors'].append(node2)\n            self.nodes[node2]['neighbors'].append(node1) # Assuming undirected graph\n        else:\n            print(\"Error: One or both nodes do not exist.\")\n\n    def get_neighbors(self, node):\n        if node in self.nodes:\n            return self.nodes[node]['neighbors']\n        else:\n            return None\n\n    def get_coordinates(self, node):\n        if node in self.nodes:\n            return self.nodes[node]['coordinates']\n        else:\n            return None\n\ndef manhattan_distance(node1_coords, node2_coords):\n    x1, y1 = node1_coords\n    x2, y2 = node2_coords\n    return abs(x1 - x2) + abs(y1 - y2)\n\ndef a_star(graph, start, goal):\n    open_set = {start}  # Nodes to be evaluated\n    closed_set = set()   # Nodes already evaluated\n    came_from = {}\n    g_score = {node: float('inf') for node in graph.nodes} # Cost from start to node\n    f_score = {node: float('inf') for node in graph.nodes} # Estimated cost from start to goal through node\n\n    g_score[start] = 0\n    f_score[start] = manhattan_distance(graph.get_coordinates(start), graph.get_coordinates(goal))\n\n    while open_set:\n        # Get the node in open_set with the lowest f_score\n        current = min(open_set, key=lambda node: f_score[node])\n\n        if current == goal:\n            return came_from  # Path found (we'll reconstruct it later)\n\n        open_set.remove(current)\n        closed_set.add(current)\n\n        for neighbor in graph.get_neighbors(current):\n            if neighbor in closed_set:\n                continue  # Ignore already evaluated neighbors\n\n            tentative_g_score = g_score[current] + 1  # Assuming each edge has a cost of 1\n\n            if tentative_g_score < g_score[neighbor]:\n                # This path to neighbor is better than any previous one.\n                came_from[neighbor] = current\n                g_score[neighbor] = tentative_g_score\n                f_score[neighbor] = g_score[neighbor] + manhattan_distance(graph.get_coordinates(neighbor), graph.get_coordinates(goal))\n\n                if neighbor not in open_set:\n                    open_set.add(neighbor)\n\n    return None  # No path found\n\n# Example Usage (Test the loop, but don't reconstruct the path yet)\ngraph = Graph()\ngraph.add_node('A', (0, 0))\ngraph.add_node('B', (1, 2))\ngraph.add_node('C', (3, 1))\ngraph.add_node('D', (4, 4))\ngraph.add_edge('A', 'B')\ngraph.add_edge('B', 'C')\ngraph.add_edge('C', 'D')\n\nstart_node = 'A'\ngoal_node = 'D'\n\ncame_from = a_star(graph, start_node, goal_node)\n\nprint(\"Came From:\", came_from)",
          hints: [
            "Use `min(open_set, key=lambda node: f_score[node])` to find the node with the lowest f_score.",
            "Remember to remove the current node from the `open_set` and add it to the `closed_set`.",
            "The `tentative_g_score` is the cost from the start node to the neighbor through the current node."
          ],
          expectedOutput: "Came From: {'B': 'A', 'C': 'B', 'D': 'C'}"
        },
        {
          id: 5,
          title: "Module 5: A* Algorithm - Path Reconstruction",
          learningText: "Now that the A* algorithm finds the `came_from` mapping, we need to reconstruct the actual path from the start to the goal. Implement the `reconstruct_path` function to trace back from the goal to the start using the `came_from` dictionary.",
          codeTemplate: "import math\n\nclass Graph:\n    def __init__(self):\n        self.nodes = {}\n\n    def add_node(self, name, coordinates):\n        self.nodes[name] = {'coordinates': coordinates, 'neighbors': []}\n\n    def add_edge(self, node1, node2):\n        if node1 in self.nodes and node2 in self.nodes:\n            self.nodes[node1]['neighbors'].append(node2)\n            self.nodes[node2]['neighbors'].append(node1) # Assuming undirected graph\n        else:\n            print(\"Error: One or both nodes do not exist.\")\n\n    def get_neighbors(self, node):\n        if node in self.nodes:\n            return self.nodes[node]['neighbors']\n        else:\n            return None\n\n    def get_coordinates(self, node):\n        if node in self.nodes:\n            return self.nodes[node]['coordinates']\n        else:\n            return None\n\ndef manhattan_distance(node1_coords, node2_coords):\n    x1, y1 = node1_coords\n    x2, y2 = node2_coords\n    return abs(x1 - x2) + abs(y1 - y2)\n\ndef a_star(graph, start, goal):\n    open_set = {start}  # Nodes to be evaluated\n    closed_set = set()   # Nodes already evaluated\n    came_from = {}\n    g_score = {node: float('inf') for node in graph.nodes} # Cost from start to node\n    f_score = {node: float('inf') for node in graph.nodes} # Estimated cost from start to goal through node\n\n    g_score[start] = 0\n    f_score[start] = manhattan_distance(graph.get_coordinates(start), graph.get_coordinates(goal))\n\n    while open_set:\n        # Get the node in open_set with the lowest f_score\n        current = min(open_set, key=lambda node: f_score[node])\n\n        if current == goal:\n            return came_from  # Path found (we'll reconstruct it later)\n\n        open_set.remove(current)\n        closed_set.add(current)\n\n        for neighbor in graph.get_neighbors(current):\n            if neighbor in closed_set:\n                continue  # Ignore already evaluated neighbors\n\n            tentative_g_score = g_score[current] + 1  # Assuming each edge has a cost of 1\n\n            if tentative_g_score < g_score[neighbor]:\n                # This path to neighbor is better than any previous one.\n                came_from[neighbor] = current\n                g_score[neighbor] = tentative_g_score\n                f_score[neighbor] = g_score[neighbor] + manhattan_distance(graph.get_coordinates(neighbor), graph.get_coordinates(goal))\n\n                if neighbor not in open_set:\n                    open_set.add(neighbor)\n\n    return None  # No path found\n\ndef reconstruct_path(came_from, current):\n    # Reconstruct the path from the goal to the start using the came_from dictionary.\n    path = [current]\n    while current in came_from:\n        current = came_from[current]\n        path.append(current)\n    path.reverse()\n    return path\n\n# Example Usage\ngraph = Graph()\ngraph.add_node('A', (0, 0))\ngraph.add_node('B', (1, 2))\ngraph.add_node('C', (3, 1))\ngraph.add_node('D', (4, 4))\ngraph.add_edge('A', 'B')\ngraph.add_edge('B', 'C')\ngraph.add_edge('C', 'D')\n\nstart_node = 'A'\ngoal_node = 'D'\n\ncame_from = a_star(graph, start_node, goal_node)\n\nif came_from:\n    path = reconstruct_path(came_from, goal_node)\n    print(\"Path found:\", path)\nelse:\n    print(\"No path found.\")",
          hints: [
            "Start with the goal node and trace back to the start using the `came_from` dictionary.",
            "Remember to reverse the path to get the correct order from start to goal.",
            "The path should include both the start and goal nodes."
          ],
          expectedOutput: "Path found: ['A', 'B', 'C', 'D']"
        },
        {
          id: 6,
          title: "Module 6: Testing and Visualization (Optional)",
          learningText: "Now that you have a working A* implementation, let's add some test cases to ensure it works correctly. You can also visualize the graph and the path found using libraries like `matplotlib` (optional). This module provides some basic test cases. Feel free to add more complex scenarios.",
          codeTemplate: "import math\n\nclass Graph:\n    def __init__(self):\n        self.nodes = {}\n\n    def add_node(self, name, coordinates):\n        self.nodes[name] = {'coordinates': coordinates, 'neighbors': []}\n\n    def add_edge(self, node1, node2):\n        if node1 in self.nodes and node2 in self.nodes:\n            self.nodes[node1]['neighbors'].append(node2)\n            self.nodes[node2]['neighbors'].append(node1) # Assuming undirected graph\n        else:\n            print(\"Error: One or both nodes do not exist.\")\n\n    def get_neighbors(self, node):\n        if node in self.nodes:\n            return self.nodes[node]['neighbors']\n        else:\n            return None\n\n    def get_coordinates(self, node):\n        if node in self.nodes:\n            return self.nodes[node]['coordinates']\n        else:\n            return None\n\ndef manhattan_distance(node1_coords, node2_coords):\n    x1, y1 = node1_coords\n    x2, y2 = node2_coords\n    return abs(x1 - x2) + abs(y1 - y2)\n\ndef a_star(graph, start, goal):\n    open_set = {start}  # Nodes to be evaluated\n    closed_set = set()   # Nodes already evaluated\n    came_from = {}\n    g_score = {node: float('inf') for node in graph.nodes} # Cost from start to node\n    f_score = {node: float('inf') for node in graph.nodes} # Estimated cost from start to goal through node\n\n    g_score[start] = 0\n    f_score[start] = manhattan_distance(graph.get_coordinates(start), graph.get_coordinates(goal))\n\n    while open_set:\n        # Get the node in open_set with the lowest f_score\n        current = min(open_set, key=lambda node: f_score[node])\n\n        if current == goal:\n            return came_from  # Path found (we'll reconstruct it later)\n\n        open_set.remove(current)\n        closed_set.add(current)\n\n        for neighbor in graph.get_neighbors(current):\n            if neighbor in closed_set:\n                continue  # Ignore already evaluated neighbors\n\n            tentative_g_score = g_score[current] + 1  # Assuming each edge has a cost of 1\n\n            if tentative_g_score < g_score[neighbor]:\n                # This path to neighbor is better than any previous one.\n                came_from[neighbor] = current\n                g_score[neighbor] = tentative_g_score\n                f_score[neighbor] = g_score[neighbor] + manhattan_distance(graph.get_coordinates(neighbor), graph.get_coordinates(goal))\n\n                if neighbor not in open_set:\n                    open_set.add(neighbor)\n\n    return None  # No path found\n\ndef reconstruct_path(came_from, current):\n    path = [current]\n    while current in came_from:\n        current = came_from[current]\n        path.append(current)\n    path.reverse()\n    return path\n\n# Test Cases\ndef test_a_star():\n    graph1 = Graph()\n    graph1.add_node('A', (0, 0))\n    graph1.add_node('B', (1, 2))\n    graph1.add_node('C', (3, 1))\n    graph1.add_node('D', (4, 4))\n    graph1.add_edge('A', 'B')\n    graph1.add_edge('B', 'C')\n    graph1.add_edge('C', 'D')\n\n    path1 = a_star(graph1, 'A', 'D')\n    if path1:\n        path1 = reconstruct_path(path1, 'D')\n    assert path1 == ['A', 'B', 'C', 'D'], f\"Test Case 1 Failed: Expected ['A', 'B', 'C', 'D'], got {path1}\"\n\n    graph2 = Graph()\n    graph2.add_node('S', (0, 0))\n    graph2.add_node('A', (1, 0))\n    graph2.add_node('B', (0, 1))\n    graph2.add_node('C', (1, 1))\n    graph2.add_node('G', (2, 1))\n    graph2.add_edge('S', 'A')\n    graph2.add_edge('S', 'B')\n    graph2.add_edge('A', 'C')\n    graph2.add_edge('B', 'C')\n    graph2.add_edge('C', 'G')\n\n    path2 = a_star(graph2, 'S', 'G')\n    if path2:\n        path2 = reconstruct_path(path2, 'G')\n    expected_path2 = ['S', 'A', 'C', 'G']\n    assert path2 == expected_path2, f\"Test Case 2 Failed: Expected {expected_path2}, got {path2}\"\n\n    print(\"All test cases passed!\")\n\ntest_a_star()",
          hints: [
            "Create different graph structures with varying connectivity.",
            "Test cases should cover scenarios with and without a path.",
            "Use `assert` statements to check if the returned path matches the expected path."
          ],
          expectedOutput: "All test cases passed!"
        }
      ]
    });

    const jsAssignment = new Assignment({
      title: 'JavaScript: Async Programming',
      description: 'Learn about Promises and async/await in JavaScript',
      class: classes[1]._id,
      modules: [
        {
          id: 1,
          title: 'Promises',
          learningText: 'Learn how to create and use Promises for async operations',
          codeTemplate: '// Create a promise that resolves after 1 second\nconst myPromise = new Promise((resolve, reject) => {\n    setTimeout(() => {\n        resolve("Success!");\n    }, 1000);\n});\n\n// Use .then to handle the resolved value\nmyPromise.then(result => {\n    console.log(result);\n});',
          hints: ['Remember that Promises take a function with resolve and reject parameters', 'Use .then to handle the resolved value'],
          expectedOutput: 'Success!'
        },
        {
          id: 2,
          title: 'Async/Await',
          learningText: 'Learn how to use async/await syntax for cleaner async code',
          codeTemplate: '// Create a function that returns a promise\nfunction delay(ms) {\n    return new Promise(resolve => setTimeout(resolve, ms));\n}\n\n// Write an async function that uses await\nasync function example() {\n    console.log("Start");\n    await delay(1000);\n    console.log("After 1 second");\n}\n\n// Call the async function\nexample();',
          hints: ['Use the "async" keyword before the function declaration', 'Use "await" before the promise to pause execution'],
          expectedOutput: 'Start\nAfter 1 second'
        }
      ]
    });

    const dataStructuresAssignment = new Assignment({
      title: 'A* Pathfinding Algorithm Implementation',
      description: 'This assignment guides you through implementing the A* pathfinding algorithm',
      class: classes[2]._id,
      modules: [
        {
          id: 1,
          title: 'Graph Representation',
          learningText: 'Learn how to represent a graph for pathfinding',
          codeTemplate: 'class Graph:\n    def __init__(self):\n        self.nodes = {}\n\n    def add_node(self, name, coordinates):\n        self.nodes[name] = {\'coordinates\': coordinates, \'neighbors\': []}\n\n    def add_edge(self, node1, node2):\n        # Your code here\n        pass',
          hints: ['Remember to update the neighbors lists for both nodes', 'Check if the nodes exist before adding edges'],
          expectedOutput: 'Graph with nodes and edges properly connected'
        },
        {
          id: 2,
          title: 'Heuristic Function',
          learningText: 'Implement the Manhattan distance heuristic',
          codeTemplate: 'def manhattan_distance(node1_coords, node2_coords):\n    # Your code here\n    pass',
          hints: ['Calculate the sum of absolute differences in x and y coordinates', 'Use the abs() function'],
          expectedOutput: 'Manhattan distance between coordinates'
        }
      ]
    });

    const savedAssignments = await Assignment.insertMany([
      pythonAssignment, 
      jsAssignment, 
      dataStructuresAssignment
    ]);

    console.log('Assignments created:', savedAssignments.map(a => a.title));

    // Create student assignments
    const studentAssignmentPromises = [];

    // For Python class
    const pythonClassStudents = [...new Set([...batch1.students])];
    for (const studentId of pythonClassStudents) {
      studentAssignmentPromises.push(
        new StudentAssignment({
          student: studentId,
          assignment: pythonAssignment._id,
          status: 'assigned'
        }).save()
      );
    }

    // For JS class
    const jsClassStudents = [...new Set([...batch2.students])];
    for (const studentId of jsClassStudents) {
      studentAssignmentPromises.push(
        new StudentAssignment({
          student: studentId,
          assignment: jsAssignment._id,
          status: 'assigned'
        }).save()
      );
    }

    // For Data Structures class
    const dsClassStudents = [...new Set([...batch3.students])];
    for (const studentId of dsClassStudents) {
      studentAssignmentPromises.push(
        new StudentAssignment({
          student: studentId,
          assignment: dataStructuresAssignment._id,
          status: 'assigned'
        }).save()
      );
    }

    await Promise.all(studentAssignmentPromises);
    console.log('Student assignments created');

    // Add some example submissions for student 1
    const studentAssignment = await StudentAssignment.findOne({
      student: students[0]._id,
      assignment: pythonAssignment._id
    });

    if (studentAssignment) {
      studentAssignment.status = 'in-progress';
      studentAssignment.progress = 50;
      studentAssignment.submissions.push({
        moduleId: 1,
        code: 'x = 10\n\nif x > 5:\n    print("x is greater than 5")',
        submittedAt: new Date()
      });
      await studentAssignment.save();
      console.log('Example submission added for student_charlie');
    }

    console.log('Database seeded successfully!');
    console.log('\nTEST ACCOUNTS:');
    console.log('Teacher Accounts:');
    console.log('- Email: alice@example.com, Password: teacher123');
    console.log('- Email: bob@example.com, Password: teacher123');
    console.log('\nStudent Accounts:');
    console.log('- Email: charlie@example.com, Password: student123');
    console.log('- Email: diana@example.com, Password: student123');
    console.log('- Email: evan@example.com, Password: student123');
    console.log('\nBatch Enrollment Codes:');
    batches.forEach(batch => {
      console.log(`- ${batch.name}: ${batch.enrollmentCode}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();