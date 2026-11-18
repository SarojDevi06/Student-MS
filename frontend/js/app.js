// Courses shown in the form and in the filter dropdown
const courses = ['BCA', 'MCA', 'B.Tech', 'M.Tech', 'BBA', 'MBA', 'B.Com', 'B.Sc'];

const pageTitles = {
  dashboard: 'Dashboard',
  students: 'Students',
  form: 'Add Student'
};

// ---------- Page elements ----------
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuButton = document.getElementById('menu-button');
const pageTitle = document.getElementById('page-title');
const navLinks = document.querySelectorAll('.nav-link');

const totalStudentsText = document.getElementById('total-students');
const activeStudentsText = document.getElementById('active-students');
const inactiveStudentsText = document.getElementById('inactive-students');
const recentTableBody = document.getElementById('recent-table-body');
const recentEmpty = document.getElementById('recent-empty');

const searchInput = document.getElementById('search-input');
const courseFilter = document.getElementById('course-filter');
const addStudentButton = document.getElementById('add-student-button');
const studentCount = document.getElementById('student-count');
const studentsTableBody = document.getElementById('students-table-body');
const studentsEmpty = document.getElementById('students-empty');

const studentForm = document.getElementById('student-form');
const studentIdInput = document.getElementById('student-id');
const courseSelect = document.getElementById('course');
const enrollmentDateInput = document.getElementById('enrollment_date');
const formTitle = document.getElementById('form-title');
const submitButton = document.getElementById('submit-button');
const cancelButton = document.getElementById('cancel-button');

const deleteModal = document.getElementById('delete-modal');
const deleteStudentName = document.getElementById('delete-student-name');
const deleteCancelButton = document.getElementById('delete-cancel');
const deleteConfirmButton = document.getElementById('delete-confirm');

const detailsModal = document.getElementById('details-modal');
const detailsContent = document.getElementById('details-content');
const detailsCloseButton = document.getElementById('details-close');

const toastContainer = document.getElementById('toast-container');

// The students currently shown in the table, and the one waiting to be deleted
let currentStudents = [];
let studentToDeleteId = null;
let searchTimer = null;

// ---------- Small helper functions ----------

// Stops text from being treated as HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

function formatStudentId(id) {
  return 'STU' + String(id).padStart(3, '0');
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function getTodayString() {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().split('T')[0];
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function openModal(modal) {
  modal.classList.add('show');
}

function closeModal(modal) {
  modal.classList.remove('show');
}

// ---------- Navigation ----------

function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('show');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
}

function showSection(name) {
  document.querySelectorAll('.page').forEach((page) => page.classList.remove('active'));
  document.getElementById(`${name}-section`).classList.add('active');

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.dataset.section === name);
  });

  pageTitle.textContent = pageTitles[name];
  closeSidebar();

  if (name === 'dashboard') loadDashboard();
  if (name === 'students') loadStudents();
}

// ---------- Dashboard ----------

async function loadDashboard() {
  try {
    const stats = await getStudentStats();

    totalStudentsText.textContent = stats.totalStudents;
    activeStudentsText.textContent = stats.activeStudents;
    inactiveStudentsText.textContent = stats.totalStudents - stats.activeStudents;

    recentTableBody.innerHTML = stats.recentStudents
      .map(
        (student) => `
          <tr>
            <td>${escapeHtml(student.roll_number)}</td>
            <td>${escapeHtml(student.full_name)}</td>
            <td>${escapeHtml(student.course)}</td>
            <td>${formatDate(student.enrollment_date)}</td>
          </tr>`
      )
      .join('');

    recentEmpty.classList.toggle('hidden', stats.recentStudents.length > 0);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ---------- Students table ----------

function buildStudentRow(student) {
  const badgeClass = student.status === 'Active' ? 'badge-active' : 'badge-inactive';

  return `
    <tr>
      <td>${formatStudentId(student.id)}</td>
      <td>${escapeHtml(student.roll_number)}</td>
      <td>
        <div class="student-cell">
          <span class="avatar">${escapeHtml(getInitials(student.full_name))}</span>
          <div>
            <div class="student-name">${escapeHtml(student.full_name)}</div>
            <div class="student-email">${escapeHtml(student.email)}</div>
          </div>
        </div>
      </td>
      <td>${escapeHtml(student.course)}</td>
      <td>${escapeHtml(student.year_semester)}</td>
      <td><span class="badge ${badgeClass}">${escapeHtml(student.status)}</span></td>
      <td>
        <div class="actions">
          <button class="btn-small btn-view" data-action="view" data-id="${student.id}">View</button>
          <button class="btn-small btn-edit" data-action="edit" data-id="${student.id}">Edit</button>
          <button class="btn-small btn-delete" data-action="delete" data-id="${student.id}">Delete</button>
        </div>
      </td>
    </tr>`;
}

async function loadStudents() {
  try {
    currentStudents = await getStudents(searchInput.value.trim(), courseFilter.value);

    studentsTableBody.innerHTML = currentStudents.map(buildStudentRow).join('');
    studentsEmpty.classList.toggle('hidden', currentStudents.length > 0);
    studentCount.textContent = `${currentStudents.length} student(s) found`;
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Handles the View, Edit and Delete buttons in the table
function handleTableClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const id = button.dataset.id;

  if (button.dataset.action === 'view') openDetails(id);
  if (button.dataset.action === 'edit') openEditForm(id);
  if (button.dataset.action === 'delete') openDeleteModal(id);
}

// ---------- View details ----------

async function openDetails(id) {
  try {
    const student = await getStudentById(id);

    const fields = [
      ['Student ID', formatStudentId(student.id)],
      ['Full Name', student.full_name],
      ['Email', student.email],
      ['Phone Number', student.phone],
      ['Roll Number', student.roll_number],
      ['Course', student.course],
      ['Year/Semester', student.year_semester],
      ['Gender', student.gender],
      ['Enrollment Date', formatDate(student.enrollment_date)],
      ['Status', student.status],
      ['Address', student.address]
    ];

    detailsContent.innerHTML = fields
      .map(
        ([label, value]) => `
          <div class="detail-item">
            <div class="detail-label">${label}</div>
            <div class="detail-value">${escapeHtml(value)}</div>
          </div>`
      )
      .join('');

    openModal(detailsModal);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ---------- Add / Edit form ----------

function resetForm() {
  studentForm.reset();
  studentIdInput.value = '';
  enrollmentDateInput.value = getTodayString();
  formTitle.textContent = 'Add New Student';
  submitButton.textContent = 'Add Student';
}

async function openEditForm(id) {
  try {
    const student = await getStudentById(id);

    resetForm();
    studentIdInput.value = student.id;

    // Fill every input whose name matches a student field
    Object.keys(student).forEach((field) => {
      const input = studentForm.elements[field];
      if (input) input.value = student[field];
    });

    formTitle.textContent = 'Edit Student';
    submitButton.textContent = 'Save Changes';

    showSection('form');
    pageTitle.textContent = 'Edit Student';
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const student = Object.fromEntries(new FormData(studentForm));
  const id = studentIdInput.value;

  submitButton.disabled = true;

  try {
    if (id) {
      await updateStudent(id, student);
      showToast('Student updated successfully');
    } else {
      await createStudent(student);
      showToast('Student added successfully');
    }

    resetForm();
    showSection('students');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    submitButton.disabled = false;
  }
}

// ---------- Delete ----------

function openDeleteModal(id) {
  const student = currentStudents.find((item) => item.id === Number(id));
  if (!student) return;

  studentToDeleteId = student.id;
  deleteStudentName.textContent = student.full_name;
  openModal(deleteModal);
}

async function handleConfirmDelete() {
  try {
    await deleteStudent(studentToDeleteId);
    closeModal(deleteModal);
    showToast('Student deleted successfully');
    loadStudents();
  } catch (error) {
    closeModal(deleteModal);
    showToast(error.message, 'error');
  }
}

// ---------- Connect everything ----------

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const section = link.dataset.section;

    // Clicking "Add Student" always starts with an empty form
    if (section === 'form') resetForm();
    showSection(section);
  });
});

menuButton.addEventListener('click', openSidebar);
overlay.addEventListener('click', closeSidebar);

addStudentButton.addEventListener('click', () => {
  resetForm();
  showSection('form');
});

// Search waits a moment after typing stops, so it doesn't call the server on every key
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadStudents, 300);
});
courseFilter.addEventListener('change', loadStudents);

studentsTableBody.addEventListener('click', handleTableClick);
studentForm.addEventListener('submit', handleFormSubmit);

cancelButton.addEventListener('click', () => {
  resetForm();
  showSection('students');
});

deleteCancelButton.addEventListener('click', () => closeModal(deleteModal));
deleteConfirmButton.addEventListener('click', handleConfirmDelete);
detailsCloseButton.addEventListener('click', () => closeModal(detailsModal));

// Clicking the dark area around a popup, or pressing Escape, closes it
[deleteModal, detailsModal].forEach((modal) => {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal(modal);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal(deleteModal);
    closeModal(detailsModal);
  }
});

// ---------- Start the app ----------

courses.forEach((course) => {
  courseFilter.add(new Option(course, course));
  courseSelect.add(new Option(course, course));
});

resetForm();
showSection('dashboard');