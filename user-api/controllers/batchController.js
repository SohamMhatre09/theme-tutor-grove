import Batch from '../models/Batch.js';
import Class from '../models/Class.js';
import Assignment from '../models/Assignment.js';
import StudentAssignment from '../models/StudentAssignment.js';
import { generateEnrollmentCode } from '../utils/helpers.js';

export const createBatch = async (req, res) => {
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
};

export const enrollInBatch = async (req, res) => {
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
};

export const getEnrolledBatches = async (req, res) => {
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
};

export const getBatchById = async (req, res) => {
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
};

export const leaveBatch = async (req, res) => {
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
};