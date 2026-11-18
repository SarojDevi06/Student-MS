# Student Management System

A full-stack web application for managing student records. Users can add, view, edit, search, filter, and delete students, and see a dashboard with quick statistics. Built as part of an internship task.

## Features

- **Dashboard** with total, active, and inactive student counts, plus a list of recently added students
- **Add, edit, view, and delete** student records
- **Search** students by name or roll number
- **Filter** students by course
- **Validation** on both the form and the server (required fields, email format, phone number, unique email and roll number)
- **Success and error notifications**
- **Confirmation popup** before deleting a student
- **Responsive design** with a sidebar that works on mobile screens
- SQLite database with **automatic table creation**

## Technologies Used

| Part     | Technology                      |
| -------- | ------------------------------- |
| Frontend | HTML, CSS, JavaScript           |
| Backend  | Node.js, Express.js             |
| Database | SQLite (using better-sqlite3)   |
| API      | REST API with JSON              |

## Project Structure

```
student-management-system/
├── backend/
│   ├── config/db.js                   # Database connection and table creation
│   ├── controllers/studentController.js
│   ├── middleware/validateStudent.js  # Input validation
│   ├── routes/studentRoutes.js
│   └── server.js                      # Express server
├── database/                          # students.db is created here automatically
├── frontend/
│   ├── css/style.css
│   ├── js/api.js                      # Calls to the backend
│   ├── js/app.js                      # Page behavior
│   └── index.html
├── package.json
└── README.md
```

## Student Information Stored

Student ID, full name, email, phone number, roll number, course, year/semester, gender, address, enrollment date, and status (Active or Inactive).

## Installation

You need [Node.js](https://nodejs.org) (version 20 or newer) installed.

1. Clone the repository:

   ```
   git clone https://github.com/YOUR-USERNAME/student-management-system.git
   cd student-management-system
   ```

2. Install the dependencies:

   ```
   npm install
   ```

## How to Run

Start the server:

```
npm start
```

Then open **http://localhost:3000** in your browser.

For development, `npm run dev` restarts the server automatically whenever you change a file.

The database file (`database/students.db`) and the students table are created automatically the first time the server runs.

## API Endpoints

Base URL: `http://localhost:3000/api/students`

| Method | Endpoint              | Description                                   |
| ------ | --------------------- | --------------------------------------------- |
| GET    | `/api/students`       | Get all students                              |
| GET    | `/api/students?search=ravi&course=BCA` | Search by name or roll number, and filter by course |
| GET    | `/api/students/stats` | Get dashboard statistics and recent students  |
| GET    | `/api/students/:id`   | Get one student                               |
| POST   | `/api/students`       | Add a new student                             |
| PUT    | `/api/students/:id`   | Update a student                              |
| DELETE | `/api/students/:id`   | Delete a student                              |

### Example request body (POST and PUT)

```json
{
  "full_name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "roll_number": "BCA2024001",
  "course": "BCA",
  "year_semester": "Semester 1",
  "gender": "Male",
  "address": "Ludhiana, Punjab",
  "enrollment_date": "2026-11-18",
  "status": "Active"
}
```

### Response codes

| Code | Meaning                                          |
| ---- | ------------------------------------------------ |
| 200  | Success                                          |
| 201  | Student created                                  |
| 400  | Invalid data                                     |
| 404  | Student or endpoint not found                    |
| 409  | Email or roll number already exists              |
| 500  | Server error                                     |

## Author

Saroj