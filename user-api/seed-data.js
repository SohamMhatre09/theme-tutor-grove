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
      title: 'Python Basics: Control Flow',
      description: 'Learn about conditionals and loops in Python',
      class: classes[0]._id,
      modules: [
        {
          id: 1,
          title: 'If Statements',
          learningText: 'Learn how to use if, elif, and else statements in Python',
          codeTemplate: 'x = 10\n\n# Write an if statement to check if x is greater than 5\nif x > 5:\n    print("x is greater than 5")',
          hints: ['Use the "if" keyword followed by a condition', 'Don\'t forget the colon at the end of the if line'],
          expectedOutput: 'x is greater than 5'
        },
        {
          id: 2,
          title: 'For Loops',
          learningText: 'Learn how to use for loops to iterate through collections',
          codeTemplate: 'numbers = [1, 2, 3, 4, 5]\n\n# Write a for loop to print each number in the list\nfor num in numbers:\n    print(num)',
          hints: ['Use the "for" keyword followed by a variable name', 'Use the "in" keyword to specify what to iterate over'],
          expectedOutput: '1\n2\n3\n4\n5'
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