
const express = require('express');
const router = express.Router();

const validateStudent = require('../backend/middleware/validateStudent');

const {
  getAllStudents,
  getDashboardStats,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../backend/controllers/studentController');

router.get('/', getAllStudents);
router.get('/stats', getDashboardStats);
router.get('/:id', getStudentById);
router.post('/', validateStudent, createStudent);
router.put('/:id', validateStudent, updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;
