const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

function init() {
  return new Promise((resolve, reject) => {
    try {
      db.prepare(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL
      )`).run();
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

function insertMessage(content) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare('INSERT INTO messages (content) VALUES (?)');
      const info = stmt.run(content);
      resolve(info.lastInsertRowid);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { init, insertMessage };
