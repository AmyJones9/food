const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/submit', (req, res) => {
  const { account } = req.body;
  const record = `${account} 登记成功\n`;
  fs.appendFileSync('data/records.txt', record);
  res.json({ message: 'Success' });
});

app.post('/submit_win', (req, res) => {
  const { account, amount } = req.body;
  const record = `${account} 赢得 ${amount}\n`;
  fs.appendFileSync('data/records.txt', record);
  res.json({ message: 'Win recorded' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});