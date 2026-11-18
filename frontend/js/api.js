const API_URL = '/api/students';

// Sends a request and returns the JSON response.
// If the server sends back an error, it is thrown so the page can show it.
async function sendRequest(url, options = {}) {
  let response;

  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
  } catch (error) {
    throw new Error('Could not connect to the server. Is it running?');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

function getStudents(search = '', course = '') {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (course) params.append('course', course);

  return sendRequest(`${API_URL}?${params.toString()}`);
}

function getStudentStats() {
  return sendRequest(`${API_URL}/stats`);
}

function getStudentById(id) {
  return sendRequest(`${API_URL}/${id}`);
}

function createStudent(student) {
  return sendRequest(API_URL, {
    method: 'POST',
    body: JSON.stringify(student)
  });
}

function updateStudent(id, student) {
  return sendRequest(`${API_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(student)
  });
}

function deleteStudent(id) {
  return sendRequest(`${API_URL}/${id}`, { method: 'DELETE' });
}