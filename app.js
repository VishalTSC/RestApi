
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const FILE_PATH = path.join(__dirname, 'users.json');

app.use(express.json());

function readUsers() {
  if (!fs.existsSync(FILE_PATH)) {
    return []; 
  }
  const data = fs.readFileSync(FILE_PATH, 'utf8');
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(users, null, 2));
}

app.get('/users', (req, res) => {
  const users = readUsers();
  res.json(users);
});

app.get('/users/search', (req, res) => {
  const city = req.query.city;
  
  if (!city) {
    return res.status(400).json({ message: 'Please provide a city query parameter' });
  }
  
  const users = readUsers();
  const filteredUsers = users.filter(u => u.city.toLowerCase() === city.toLowerCase());

  if(filteredUsers.length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json(filteredUsers);
});

app.get('/users/:id', (req, res) => {
  const users = readUsers();
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});


app.post('/users', (req, res) => {
  const { name, city } = req.body;
  
  if (!name || !city) {
    return res.status(400).json({ message: 'Name and city are required' });
  }
  
  const users = readUsers();
  
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  
  const newUser = { id: newId, name, city };
  users.push(newUser);
  
  writeUsers(users);
  
  res.status(201).json(newUser);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
