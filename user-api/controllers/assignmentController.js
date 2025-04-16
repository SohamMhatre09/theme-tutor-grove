import Assignment from '../models/Assignment.js';
import Class from '../models/Class.js';
import Batch from '../models/Batch.js';
import StudentAssignment from '../models/StudentAssignment.js';

export const createAssignment = async (req, res) => {
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
};

export const getClassAssignments = async (req, res) => {
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
};

export const getAssignmentById = async (req, res) => {
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
};

export const getStudentAssignments = async (req, res) => {
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
};

export const submitAssignment = async (req, res) => {
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
};

export const completeModule = async (req, res) => {
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
};

export const getCompletedModules = async (req, res) => {
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
};