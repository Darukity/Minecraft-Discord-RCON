// Generate a unique id for each user
// Uses id.json to store id counter

const fs = require('fs');

// tryes to read id.json, if it doesn't exist, creates it
let id = 0;
try {
    id = JSON.parse(fs.readFileSync('registration/id.json')).id;
} catch (error) {
    fs.writeFileSync('registration/id.json', JSON.stringify({ id: 0 }));
}

module.exports = {
    newId: function () {
        id += 1;
        fs.writeFileSync('registration/id.json', JSON.stringify({ id: id }));
        return id;
    }
}