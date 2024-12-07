// services/userData.js
const fs = require('fs');
const path = require('path');

/**
 * Retrieves a paginated list of users from the users.json file.
 * @param {number} page - The current page number.
 * @param {number} pageSize - The number of users to fetch per page.
 * @returns {Promise<Array>} - A list of users for the given page.
 */
function retrieveUserList(page = 1, pageSize = 10) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, 'users.json');  // Adjust the path as needed

        // Read the users.json file
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return reject('Error reading users.json file: ' + err);
            }

            try {
                const users = JSON.parse(data);  // Parse the JSON data

                // Calculate the start index and end index for pagination
                const startIndex = (page - 1) * pageSize;
                const endIndex = startIndex + pageSize;

                // Slice the users array based on the pagination parameters
                const paginatedUsers = users.slice(startIndex, endIndex);

                resolve(paginatedUsers);  // Return the paginated list of users
            } catch (parseError) {
                reject('Error parsing users.json file: ' + parseError);
            }
        });
    });
}

module.exports = {
    retrieveUserList,
};
