const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Path to the JSON file where we'll store user data
const dataPath = path.join(__dirname, 'users.json');

// Helper function to read user data from JSON file
function readUserData() {
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {}; // Return empty object if file doesn't exist or is empty
    }
}

// Helper function to write user data to JSON file
function writeUserData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Register a new user
async function registerUser(username, password) {
    const users = readUserData();

    // Check if the username already exists
    if (users[username]) {
        throw new Error('Username already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store the new user in the users object
    users[username] = { password: hashedPassword };

    // Write updated user data back to the file
    writeUserData(users);
}

// Login a user
async function loginUser(username, password) {
    const users = readUserData();

    // Check if the user exists
    const user = users[username];
    if (!user) {
        return false; // User not found
    }

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch;
}

// Export the functions
module.exports = {
    registerUser,
    loginUser
};
