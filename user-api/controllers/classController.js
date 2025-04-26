import Class from '../models/Class.js';
import Batch from '../models/Batch.js';

export const createClass = async (req, res) => {
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
};

export const getTeacherClasses = async (req, res) => {
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
};

export const getClassById = async (req, res) => {
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
};

export const getClassBatches = async (req, res) => {
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
};