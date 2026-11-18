const validGenders = ['Male', 'Female', 'Other'];
const validStatuses = ['Active', 'Inactive'];

function validateStudent(req, res, next) {
  const body = req.body || {};

  // Trim every value so extra spaces don't get saved
  const student = {
    full_name: String(body.full_name || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    phone: String(body.phone || '').trim(),
    roll_number: String(body.roll_number || '').trim(),
    course: String(body.course || '').trim(),
    year_semester: String(body.year_semester || '').trim(),
    gender: String(body.gender || '').trim(),
    address: String(body.address || '').trim(),
    enrollment_date: String(body.enrollment_date || '').trim(),
    status: String(body.status || 'Active').trim()
  };

  const errors = [];

  if (student.full_name.length < 2) {
    errors.push('Full name must be at least 2 characters');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
    errors.push('Please enter a valid email address');
  }

  if (!/^[0-9+\-\s]{7,15}$/.test(student.phone)) {
    errors.push('Phone number must be 7 to 15 digits');
  }

  if (!student.roll_number) {
    errors.push('Roll number is required');
  }

  if (!student.course) {
    errors.push('Course is required');
  }

  if (!student.year_semester) {
    errors.push('Year/Semester is required');
  }

  if (!validGenders.includes(student.gender)) {
    errors.push('Gender must be Male, Female or Other');
  }

  if (!student.address) {
    errors.push('Address is required');
  }

  const isDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(student.enrollment_date);
  if (!isDateFormat || isNaN(new Date(student.enrollment_date))) {
    errors.push('Enrollment date must be a valid date');
  }

  if (!validStatuses.includes(student.status)) {
    errors.push('Status must be Active or Inactive');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('. '), details: errors });
  }

  // Replace the body with the cleaned version
  req.body = student;
  next();
}

module.exports = validateStudent;