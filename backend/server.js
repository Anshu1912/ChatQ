// Import required modules
const express = require('express');
const cors = require('cors'); 
const bodyParser = require('body-parser');
const auth = require('./auth'); // Import custom authentication functions (registerUser, loginUser)
//const { retrieveUserList } = require('./userDataOperation');
// Initialize Express app
const app = express();
const port = 8000;

app.use(cors()); // Enable CORS for all routes

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Define routes

// Default route for testing server
app.get('/', (req, res) => {
    res.send('Welcome to the MQTT Chat App Backend');
});

// Route for user registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Call auth function to register user
        await auth.registerUser(username, password);
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error registering user', error: error.message });
    }
});

// Route for user login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Call auth function to authenticate user
        const isAuthenticated = await auth.loginUser(username, password);

        if (isAuthenticated) {
            res.status(200).send({ message: 'Login successful' });
        } else {
            res.status(401).send({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Error logging in', error: error.message });
    }
});

const fs = require('fs').promises;
const path = require('path');
const usersFilePath = path.join(__dirname,'users.json');

app.get('/users', async (req, res) => {
    const { page = 1, pageSize = 5 } = req.query;

    try {
        // Read users from JSON file
        const usersData = JSON.parse(await fs.readFile(usersFilePath, 'utf8'));

        // Convert the object to an array of users
        const userArray = Object.keys(usersData).map(username => ({
            username: username,
            password: usersData[username].password
        }));

        // Pagination
        const startIndex = (page - 1) * pageSize;
        const paginatedUsers = userArray.slice(startIndex, startIndex + pageSize);

        res.json({
            users: paginatedUsers,
            total: userArray.length, // Total number of users
        });
    } catch (error) {
        res.status(500).send('Error retrieving user list: ' + error.message);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
