const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// The database file lives in the /database folder
const databaseFolder = path.join(__dirname, '..', '..', 'database');
if (!fs.existsSync(databaseFolder)) {
  fs.mkdirSync(databaseFolder);
}

const db = new Database(path.join(databaseFolder, 'students.db'));

// Create the students table on first run
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    roll_number TEXT NOT NULL UNIQUE,
    course TEXT NOT NULL,
    year_semester TEXT NOT NULL,
    gender TEXT NOT NULL,
    address TEXT NOT NULL,
    enrollment_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;