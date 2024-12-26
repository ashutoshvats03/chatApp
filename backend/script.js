const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);



const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Your frontend URL
    methods: ['GET', 'POST'],
  },
});

const users = {}; // Store names associated with socket IDs

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for a name from the client
  socket.on('setName', (name) => {
    users[socket.id] = name; // Save the name with socket.id
  });

  // Listen for incoming chat messages
  socket.on('chat message', (msg) => {
    const name = users[socket.id] || 'Anonymous'; // Default to 'Anonymous' if no name is set
    io.emit('chat message', { msg, id: socket.id, name });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete users[socket.id]; // Remove the user from the list
  });
});






const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

const cors = require('cors');
app.use(cors({ origin: 'http://localhost:5173' }));


const userids = []; // Replace this with a proper database in production

// Registration route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const existingUser = userids.find(u => u.username === username);
    if (existingUser) {
        console.log('User already exists');
        return res.status(400).json({ message: 'User already exists' });
    }

 
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword); // Log the hashed password

        userids.push({ username, password: hashedPassword });
        console.log('User created:', username);
        res.status(201).json({ message: 'User created' });

    
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = userids.find(u => u.username === username);

    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(403);
    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
        if (err) return res.sendStatus(403);
        req.user = decoded;
        next();
    });
};

// Protected route
app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'Protected data', user: req.user });
});

server.listen(5000, () => {
    console.log('Server running on port 5000');
  });
