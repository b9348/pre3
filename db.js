// db.js
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken'; // 导入jsonwebtoken库

const db = new sqlite3.Database('./users.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
});

const registerUser = (username, password, callback) => {
  db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], function (err) {
    if (err) {
      return callback(err, null);
    }
    const userId = this.lastID;
    const token = jwt.sign({ id: userId, username: username }, 'your_secret_key', { expiresIn: '1h' }); // 生成token
    callback(null, { id: userId, token }); // 返回id和token
  });
};

const loginUser = (username, password, callback) => {
  db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
    if (err) {
      return callback(err, null);
    }
    if (row) {
      const token = jwt.sign({ id: row.id, username: row.username }, 'your_secret_key', { expiresIn: '1h' }); // 生成token
      callback(null, { ...row, token }); // 返回用户信息和token
    } else {
      callback(null, null);
    }
  });
};

export { registerUser, loginUser };