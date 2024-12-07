const apiBaseUrl = 'http://localhost:8000'; // Backend server base URL
import { connectToChat, sendMessage as sendMessageToMqtt } from './mqttClient.js';

let currentUser = ""; // Store the logged-in or registered username
let mqttClient = null;
let users = []; // Global user list
let currentPage = 1; // Current pagination page
const pageSize = 5; // Number of users per page

// Login function
async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${apiBaseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            currentUser = username;
            displayChatWindow();
            mqttClient = connectToChat(username); // Initialize MQTT connection
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.');
    }
}

// Register function
async function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            displayLoginPage();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred. Please try again.');
    }
}

// Send Message function
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();

    if (!message) {
        alert('Message cannot be empty!');
        return;
    }

    if (mqttClient && currentUser) {
        sendMessageToMqtt(mqttClient, message, currentUser);
    }

    messageInput.value = ''; // Clear the input field
}

// Retrieve user list with pagination
async function retrieveUserList({ page = 1, pageSize = 5 } = {}) {
    displayUserlistPage();

    try {
        const query = new URLSearchParams({ page, pageSize });
        const response = await fetch(`${apiBaseUrl}/users?${query.toString()}`);

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        users = data.users;

        const userListContainer = document.getElementById('userListContainer');
        userListContainer.innerHTML = ''; // Clear previous content

        if (!users || users.length === 0) {
            userListContainer.innerHTML = '<p>No users found.</p>';
            return;
        }

        users.forEach(user => {
            const userListItem = document.createElement('li');
            userListItem.classList.add('user-item');
            userListItem.textContent = `Username: ${user.username}`;
            userListContainer.appendChild(userListItem);
        });

        updatePaginationControls(data.total, page, pageSize);
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to retrieve users. Please try again later.');
    }
}

// Sort users A-Z or Z-A
function handleSort() {
    const sortSelect = document.querySelector('#userListHeader select');
    const selectedSortOption = sortSelect.value;

    if (selectedSortOption === 'A-Z') {
        users.sort((a, b) => a.username.localeCompare(b.username));
    } else if (selectedSortOption === 'Z-A') {
        users.sort((a, b) => b.username.localeCompare(a.username));
    }

    renderUserList();
}

// Render sorted or paginated user list
function renderUserList() {
    const userListContainer = document.getElementById('userListContainer');
    userListContainer.innerHTML = ''; // Clear existing users

    users.forEach(user => {
        const userListItem = document.createElement('li');
        userListItem.classList.add('user-item');
        userListItem.textContent = `Username: ${user.username}`;
        userListContainer.appendChild(userListItem);
    });
}

// Load specific page
async function loadPage(pageNumber) {
    if (pageNumber < 1) return;
    currentPage = pageNumber;
    await retrieveUserList({ page: currentPage, pageSize: pageSize });
}

// Update pagination controls
function updatePaginationControls(totalUsers, currentPage, pageSize) {
    const totalPages = Math.ceil(totalUsers / pageSize);
    document.getElementById('displayPreviousPage').style.visibility = currentPage > 1 ? 'visible' : 'hidden';
    document.getElementById('displayNextPage').style.visibility = currentPage < totalPages ? 'visible' : 'hidden';
}

// Search users function
function searchUsers() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase(); // Get the input value
    if (searchQuery === '') {
        renderUserList(); // Show all users if search query is empty
    } else {
        const filteredUsers = users.filter(user => user.username.toLowerCase().includes(searchQuery)); // Filter users by username
        const userListContainer = document.getElementById('userListContainer');
        userListContainer.innerHTML = ''; // Clear previous content

        if (filteredUsers.length === 0) {
            userListContainer.innerHTML = '<p>No users found. Please register.</p>';
        } else {
            filteredUsers.forEach(user => {
                const userListItem = document.createElement('li');
                userListItem.classList.add('user-item');
                userListItem.textContent = `Username: ${user.username}`;
                userListContainer.appendChild(userListItem);
            });
        }
    }
}

// Utility functions to switch between views
function displayChatWindow() {
    toggleDisplay('chatPage');
}

function displayLoginPage() {
    toggleDisplay('loginPage');
}

function displayRegisterPage() {
    toggleDisplay('registerPage');
}

function displayUserlistPage() {
    toggleDisplay('userListPage');
}

function toggleDisplay(visiblePage) {
    const pages = ['loginPage', 'registerPage', 'chatPage', 'userListPage'];
    pages.forEach(page => {
        document.getElementById(page).style.display = page === visiblePage ? 'block' : 'none';
    });
}

// Event Listeners
document.getElementById('loginButton').addEventListener('click', login);
document.getElementById('displayLoginPage').addEventListener('click', displayLoginPage);
document.getElementById('registerButton').addEventListener('click', register);
document.getElementById('displayRegister').addEventListener('click', displayRegisterPage);
document.getElementById('displayRegisterfromList').addEventListener('click', displayRegisterPage);
document.getElementById('sendMessage').addEventListener('click', sendMessage);
document.getElementById('displayUserListPage').addEventListener('click', () => retrieveUserList());
document.querySelector('#userListHeader select').addEventListener('change', handleSort);
document.getElementById('displayPreviousPage').addEventListener('click', () => loadPage(currentPage - 1));
document.getElementById('displayNextPage').addEventListener('click', () => loadPage(currentPage + 1));

// Event listener for search functionality
document.getElementById('searchButton').addEventListener('click', searchUsers);

// Event listener to trigger search on every input in the search field
document.getElementById('searchInput').addEventListener('input', searchUsers);
