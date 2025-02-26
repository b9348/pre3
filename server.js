// server.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { registerUser, loginUser } from './db.js';
import multer from 'multer';
import csv from 'csv-parser';
import stream from 'stream';
import { Buffer } from 'buffer';


const app = express();
app.use(bodyParser.json());
app.use(cors());

// 修改multer配置
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // 修正文件名编码处理
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, true);
  }
});

// 添加新的上传接口
app.post('/uploadCsv', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const results = [];
    const buffer = req.file.buffer;
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    bufferStream
      .pipe(csv({ headers: false }))
      .on('data', (row) => {
        const rowValues = Object.values(row); // 将行数据转换为数组
        const csvName = rowValues[0];         // 取第一个元素作为名称
        const csvVal = rowValues.slice(1);    // 剩余元素作为值数组
        results.push({ csvName, csvVal });    // 生成新格式对象
      })
      .on('end', () => {
        res.status(200).json({
          filename: req.file.originalname, // 添加文件名
          data: results
        });
      })
      .on('error', (error) => {
        console.error('CSV processing error:', error);
        res.status(500).json({ error: 'CSV processing failed' });
      });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/register', (req, res) => {
  console.log('Received register request:', req.body);
  const { username, password } = req.body;
  registerUser(username, password, (err, result) => {
    if (err) {
      console.error('Register error:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Register success:', result);
    res.status(200).json({ done: true, token: result.token });
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