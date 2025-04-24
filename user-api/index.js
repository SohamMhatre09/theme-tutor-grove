import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();
console.log('Environment variables loaded:', {
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT
});

// Create meta information for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect("mongodb+srv://user-admin:user-admin@customerservicechat.4uk1s.mongodb.net/?retryWrites=true&w=majority&appName=CustomerServiceChat")
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  }
});

// Class Schema
const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Batch Schema
const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  enrollmentCode: {
    type: String,
    required: true,
    unique: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate a unique enrollment code
const generateEnrollmentCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Assignment Schema
const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  language: { type: String, required: true },
  requirements: [String],
  modules: [{
    id: Number,
    title: String,
    learningText: String,
    codeTemplate: String,
    hints: [String],
    expectedOutput: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Student Assignment Schema
const studentAssignmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  status: {
    type: String,
    enum: ['assigned', 'in-progress', 'completed'],
    default: 'assigned'
  },
  progress: {
    type: Number,
    default: 0
  },
  submissions: [{
    moduleId: Number,
    code: String,
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);
const Class = mongoose.model('Class', classSchema);
const Batch = mongoose.model('Batch', batchSchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);
const StudentAssignment = mongoose.model('StudentAssignment', studentAssignmentSchema);

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Routes
// Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate role if provided
    if (role && !['student', 'teacher'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'student' // Default to student if no role specified
    });

    // Save user to database
    const savedUser = await user.save();

    // Create JWT token
    const token = jwt.sign(
      { id: savedUser._id, username: savedUser.username, role: savedUser.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // If role is specified in the request, validate that it matches the user's actual role
    if (role && role !== user.role) {
      return res.status(403).json({ 
        message: `Access denied. You cannot login as ${role}. Your role is ${user.role}.`
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User Profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Change Password
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Forgot Password - Request
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Generate password reset token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_RESET_SECRET || 'your_reset_secret_key',
      { expiresIn: '1h' }
    );

    // In a real application, you would send an email with the reset link
    // For simplicity, we'll just return the token
    res.status(200).json({ 
      message: 'Password reset link has been sent to your email',
      resetToken: token // In production, don't expose this
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_RESET_SECRET || 'your_reset_secret_key');
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a class (teachers only)
app.post('/api/classes', authenticateToken, async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create classes' });
    }

    const { name, subject, description } = req.body;

    // Validate input
    if (!name || !subject) {
      return res.status(400).json({ message: 'Class name and subject are required' });
    }

    // Create the class
    const newClass = new Class({
      name,
      subject,
      description,
      teacher: req.user.id
    });

    const savedClass = await newClass.save();

    res.status(201).json({
      message: 'Class created successfully',
      class: savedClass
    });
  } catch (error) {
    console.error('Class creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all classes for a teacher
app.get('/api/classes/teacher', authenticateToken, async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const classes = await Class.find({ teacher: req.user.id });

    res.status(200).json(classes);
  } catch (error) {
    console.error('Fetch classes error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific class by ID
app.get('/api/classes/:id', authenticateToken, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is the teacher of this class or a student in one of its batches
    if (req.user.role === 'teacher' && classItem.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(classItem);
  } catch (error) {
    console.error('Fetch class error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a batch for a class (teachers only)
app.post('/api/batches', authenticateToken, async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create batches' });
    }

    const { name, classId } = req.body;

    // Validate input
    if (!name || !classId) {
      return res.status(400).json({ message: 'Batch name and class ID are required' });
    }

    // Check if class exists and belongs to the teacher
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    if (classItem.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate a unique enrollment code
    let enrollmentCode = generateEnrollmentCode();
    let isUnique = false;
    while (!isUnique) {
      const existingBatch = await Batch.findOne({ enrollmentCode });
      if (!existingBatch) {
        isUnique = true;
      } else {
        enrollmentCode = generateEnrollmentCode();
      }
    }

    // Create the batch
    const newBatch = new Batch({
      name,
      class: classId,
      enrollmentCode,
      students: []
    });

    const savedBatch = await newBatch.save();

    res.status(201).json({
      message: 'Batch created successfully',
      batch: savedBatch
    });
  } catch (error) {
    console.error('Batch creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all batches for a class
app.get('/api/classes/:classId/batches', authenticateToken, async (req, res) => {
  try {
    const classId = req.params.classId;
    
    // Check if class exists
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check permissions
    if (req.user.role === 'teacher' && classItem.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const batches = await Batch.find({ class: classId });

    res.status(200).json(batches);
  } catch (error) {
    console.error('Fetch batches error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student enrollment with code
app.post('/api/batches/enroll', authenticateToken, async (req, res) => {
  try {
    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can enroll in batches' });
    }

    const { enrollmentCode } = req.body;

    // Validate input
    if (!enrollmentCode) {
      return res.status(400).json({ message: 'Enrollment code is required' });
    }

    // Find the batch with the provided code
    const batch = await Batch.findOne({ enrollmentCode });
    if (!batch) {
      return res.status(404).json({ message: 'Invalid enrollment code' });
    }

    // Check if student is already enrolled
    if (batch.students.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already enrolled in this batch' });
    }

    // Add student to the batch
    batch.students.push(req.user.id);
    await batch.save();

    // Get class to enroll student in all its assignments
    const classItem = await Class.findById(batch.class);
    
    // Find all assignments for this class and create student assignments
    const assignments = await Assignment.find({ class: batch.class });
    
    for (const assignment of assignments) {
      const newStudentAssignment = new StudentAssignment({
        student: req.user.id,
        assignment: assignment._id,
        status: 'assigned'
      });
      await newStudentAssignment.save();
    }

    res.status(200).json({
      message: 'Successfully enrolled in the batch',
      batch: {
        id: batch._id,
        name: batch.name,
        class: batch.class
      }
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all batches a student is enrolled in
app.get('/api/batches/enrolled', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const batches = await Batch.find({ students: req.user.id })
      .populate({
        path: 'class',
        select: 'name subject description',
        populate: {
          path: 'teacher',
          select: 'username email'
        }
      });

    res.status(200).json(batches);
  } catch (error) {
    console.error('Fetch enrolled batches error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific batch by ID with assignments
app.get('/api/batches/:id', authenticateToken, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate({
        path: 'class',
        select: 'name subject description',
        populate: {
          path: 'teacher',
          select: 'username email'
        }
      })
      .populate({
        path: 'students',
        select: 'username email'
      });
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check permissions
    if (req.user.role === 'teacher') {
      // For teachers, check if they own the class this batch belongs to
      const classItem = await Class.findById(batch.class._id);
      if (classItem.teacher.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'student') {
      // For students, check if they are enrolled in this batch
      if (!batch.students.some(student => student._id.toString() === req.user.id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Get assignments for this batch's class
    const assignments = await Assignment.find({ class: batch.class._id });
    
    // If student, get their progress for each assignment
    let enrichedAssignments = [...assignments];
    
    if (req.user.role === 'student') {
      const studentAssignments = await StudentAssignment.find({
        student: req.user.id,
        assignment: { $in: assignments.map(a => a._id) }
      });
      
      // Create a map for quick lookup
      const progressMap = {};
      studentAssignments.forEach(sa => {
        progressMap[sa.assignment.toString()] = {
          progress: sa.progress,
          status: sa.status,
          submitted: sa.status === 'completed'
        };
      });
      
      // Enrich assignments with student progress
      enrichedAssignments = assignments.map(assignment => {
        const assignmentObj = assignment.toObject();
        const progress = progressMap[assignment._id.toString()] || {
          progress: 0,
          status: 'assigned',
          submitted: false
        };
        
        return {
          ...assignmentObj,
          ...progress
        };
      });
    }

    // Return batch with assignments and formatted student list
    const batchData = batch.toObject();
    
    // Format student list to include full names
    const studentsList = batchData.students.map(student => ({
      id: student._id,
      name: student.username,
      email: student.email
    }));

    res.status(200).json({
      ...batchData,
      students: studentsList,
      assignments: enrichedAssignments
    });
  } catch (error) {
    console.error('Fetch batch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create an assignment for a class (teachers only)
app.post('/api/assignments', authenticateToken, async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create assignments' });
    }

    const { title, description, classId, modules, language, requirements } = req.body;

    // Validate input
    if (!title || !description || !classId || !modules || !language) {
      return res.status(400).json({ message: 'Title, description, class ID, modules, and language are required' });
    }

    // Check if class exists and belongs to the teacher
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    if (classItem.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create the assignment
    const newAssignment = new Assignment({
      title,
      description,
      class: classId,
      modules,
      language,
      requirements: requirements || []
    });

    const savedAssignment = await newAssignment.save();

    // Assign to all students in all batches of this class
    const batches = await Batch.find({ class: classId });
    const allStudentIds = new Set();

    for (const batch of batches) {
      for (const studentId of batch.students) {
        allStudentIds.add(studentId.toString());
      }
    }

    // Create student assignments
    const studentAssignmentPromises = Array.from(allStudentIds).map(studentId => {
      const newStudentAssignment = new StudentAssignment({
        student: studentId,
        assignment: savedAssignment._id,
        status: 'assigned'
      });
      return newStudentAssignment.save();
    });

    await Promise.all(studentAssignmentPromises);

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment: savedAssignment
    });
  } catch (error) {
    console.error('Assignment creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all assignments for a class
app.get('/api/classes/:classId/assignments', authenticateToken, async (req, res) => {
  try {
    const classId = req.params.classId;
    
    // Check if class exists
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // For teachers, check if they own the class
    if (req.user.role === 'teacher' && classItem.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // For students, check if they are enrolled in any batch of this class
    if (req.user.role === 'student') {
      const enrolledBatch = await Batch.findOne({
        class: classId,
        students: req.user.id
      });
      
      if (!enrolledBatch) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const assignments = await Assignment.find({ class: classId });

    res.status(200).json(assignments);
  } catch (error) {
    console.error('Fetch assignments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific assignment
app.get('/api/assignments/:id', authenticateToken, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Get the class to check permissions
    const classItem = await Class.findById(assignment.class);
    
    // For teachers, check if they own the class
    if (req.user.role === 'teacher' && classItem.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // For students, check if they are enrolled in any batch of this class
    if (req.user.role === 'student') {
      const enrolledBatch = await Batch.findOne({
        class: assignment.class,
        students: req.user.id
      });
      
      if (!enrolledBatch) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.status(200).json(assignment);
  } catch (error) {
    console.error('Fetch assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all assignments for a student
app.get('/api/student/assignments', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const studentAssignments = await StudentAssignment.find({ student: req.user.id })
      .populate({
        path: 'assignment',
        populate: {
          path: 'class',
          select: 'name subject',
          populate: {
            path: 'teacher',
            select: 'username'
          }
        }
      });

    res.status(200).json(studentAssignments);
  } catch (error) {
    console.error('Fetch student assignments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit code for an assignment module
app.post('/api/assignments/:id/submit', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit assignments' });
    }

    const { moduleId, code } = req.body;
    const assignmentId = req.params.id;

    // Validate input
    if (!moduleId || !code) {
      return res.status(400).json({ message: 'Module ID and code are required' });
    }

    // Check if the student has this assignment
    let studentAssignment = await StudentAssignment.findOne({
      student: req.user.id,
      assignment: assignmentId
    });

    if (!studentAssignment) {
      return res.status(404).json({ message: 'Assignment not found or not assigned to you' });
    }

    // Update or add the submission
    const submissionIndex = studentAssignment.submissions.findIndex(s => s.moduleId === moduleId);
    
    if (submissionIndex >= 0) {
      studentAssignment.submissions[submissionIndex].code = code;
      studentAssignment.submissions[submissionIndex].submittedAt = new Date();
    } else {
      studentAssignment.submissions.push({
        moduleId,
        code,
        submittedAt: new Date()
      });
    }

    // Update progress
    const assignment = await Assignment.findById(assignmentId);
    const totalModules = assignment.modules.length;
    const completedModules = new Set(studentAssignment.submissions.map(s => s.moduleId)).size;
    studentAssignment.progress = Math.floor((completedModules / totalModules) * 100);

    if (studentAssignment.progress === 100) {
      studentAssignment.status = 'completed';
    } else if (studentAssignment.progress > 0) {
      studentAssignment.status = 'in-progress';
    }

    await studentAssignment.save();

    res.status(200).json({
      message: 'Submission successful',
      progress: studentAssignment.progress,
      status: studentAssignment.status
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark a module as completed
app.post('/api/assignments/:id/modules/:moduleId/complete', authenticateToken, async (req, res) => {
  try {
    console.log('API: Marking module as completed:', req.params);
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can mark modules as completed' });
    }

    const assignmentId = req.params.id;
    const moduleId = Number(req.params.moduleId);

    console.log('Looking for student assignment:', { student: req.user.id, assignment: assignmentId });
    
    // Find the student assignment
    let studentAssignment = await StudentAssignment.findOne({
      student: req.user.id,
      assignment: assignmentId
    });

    console.log('Found student assignment:', studentAssignment ? studentAssignment._id : 'none');

    if (!studentAssignment) {
      // If no student assignment exists yet, create one
      console.log('Creating new student assignment');
      
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
      
      studentAssignment = new StudentAssignment({
        student: req.user.id,
        assignment: assignmentId,
        status: 'in-progress',
        progress: 0,
        submissions: []
      });
    }

    // Check if the submission for this module exists
    const submissionExists = studentAssignment.submissions.some(
      submission => submission.moduleId === moduleId
    );

    // If submission doesn't exist, create it
    if (!submissionExists) {
      studentAssignment.submissions.push({
        moduleId,
        code: req.body.code || '',
        submittedAt: new Date()
      });
      console.log(`Added new submission for module ${moduleId}`);
    } else {
      // Update existing submission
      const submissionIndex = studentAssignment.submissions.findIndex(s => s.moduleId === moduleId);
      if (req.body.code) {
        studentAssignment.submissions[submissionIndex].code = req.body.code;
      }
      studentAssignment.submissions[submissionIndex].submittedAt = new Date();
      console.log(`Updated existing submission for module ${moduleId}`);
    }

    // Get the assignment to calculate progress
    const assignment = await Assignment.findById(assignmentId);
    if (assignment && assignment.modules) {
      const totalModules = assignment.modules.length;
      
      // Get unique completed modules
      const completedModules = new Set(
        studentAssignment.submissions.map(s => s.moduleId)
      );
      
      // Update progress
      studentAssignment.progress = Math.floor((completedModules.size / totalModules) * 100);

      if (studentAssignment.progress === 100) {
        studentAssignment.status = 'completed';
      } else if (studentAssignment.progress > 0) {
        studentAssignment.status = 'in-progress';
      }

      console.log('Updating progress to:', studentAssignment.progress);
    }
    
    await studentAssignment.save();

    // Return completed modules as array
    const completedModuleIds = studentAssignment.submissions.map(sub => sub.moduleId);
    
    res.status(200).json({
      message: 'Module marked as completed',
      completedModules: completedModuleIds,
      progress: studentAssignment.progress,
      status: studentAssignment.status
    });
  } catch (error) {
    console.error('Error marking module as completed:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get completed modules for an assignment
app.get('/api/assignments/:id/completed-modules', authenticateToken, async (req, res) => {
  try {
    console.log('API: Fetching completed modules for assignment:', req.params.id);
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const assignmentId = req.params.id;

    // Find the student assignment
    const studentAssignment = await StudentAssignment.findOne({
      student: req.user.id,
      assignment: assignmentId
    });

    console.log('Found student assignment:', studentAssignment ? studentAssignment._id : 'none');

    if (!studentAssignment) {
      console.log('No student assignment found, returning empty array');
      return res.status(200).json({
        completedModules: [],
        progress: 0,
        status: 'assigned'
      });
    }

    // Extract unique module IDs from submissions
    const completedModules = studentAssignment.submissions.map(submission => submission.moduleId);

    console.log('Completed modules:', completedModules);

    res.status(200).json({
      completedModules,
      progress: studentAssignment.progress,
      status: studentAssignment.status
    });
  } catch (error) {
    console.error('Error fetching completed modules:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get completed modules for an assignment
app.get('/api/assignments/:id/completed-modules', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching completed modules for assignment:', req.params.id);
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const assignmentId = req.params.id;

    // Find the student assignment
    const studentAssignment = await StudentAssignment.findOne({
      student: req.user.id,
      assignment: assignmentId
    });

    console.log('Found student assignment:', studentAssignment ? studentAssignment._id : 'none');

    if (!studentAssignment) {
      return res.status(404).json({ message: 'Assignment not found or not assigned to you' });
    }

    // Extract unique module IDs from submissions
    const completedModules = Array.from(
      new Set(studentAssignment.submissions.map(submission => submission.moduleId))
    );

    console.log('Completed modules:', completedModules);

    res.status(200).json({
      completedModules,
      progress: studentAssignment.progress,
      status: studentAssignment.status
    });
  } catch (error) {
    console.error('Error fetching completed modules:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student can opt out (leave) a batch
app.post('/api/batches/:id/leave', authenticateToken, async (req, res) => {
  try {
    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can leave batches' });
    }

    const batchId = req.params.id;

    // Find the batch
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check if student is enrolled in the batch
    if (!batch.students.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are not enrolled in this batch' });
    }

    // Remove student from the batch
    batch.students = batch.students.filter(
      studentId => studentId.toString() !== req.user.id
    );
    await batch.save();

    // Find and delete all student assignments for this class
    const classId = batch.class;
    const assignments = await Assignment.find({ class: classId });
    const assignmentIds = assignments.map(assignment => assignment._id);

    // Delete student's assignments for this class
    await StudentAssignment.deleteMany({
      student: req.user.id,
      assignment: { $in: assignmentIds }
    });

    res.status(200).json({
      message: 'Successfully left the batch',
      batchId: batch._id
    });
  } catch (error) {
    console.error('Leave batch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the User API');
});
// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});