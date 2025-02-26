// server.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { loginUser, getAllCdkeysWithTokenValidation } from './db.js';


const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: '*', // 允许所有来源
  credentials: true // 允许带cookie
}));



// 添加新的获取cdkeys接口
app.post('/getAllCdkeys', (req, res) => {
  const token = req.headers['authorization']; // 从请求头中获取token 

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // 假设token格式为 "Bearer <token>"
  const tokenValue = token.split(' ')[1];

  getAllCdkeysWithTokenValidation(tokenValue, (err, cdkeys) => {
    if (err) {
      console.error('Error fetching cdkeys:', err);
      return res.status(401).json({ error: err.message });
    }
    res.status(200).json(cdkeys);
  });
});


app.post('/login', (req, res) => {
  console.log('Received login request:', req.body);
  const { username, password } = req.body;
  loginUser(username, password, (err, result) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result) {
      console.log('Login success:', result);
      res.status(200).json({ done: true, token: result.token });
    } else {
      console.log('Login failed');
      res.status(401).json({ done: false, message: 'Invalid username or password' });
    }
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});