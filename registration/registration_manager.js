const fs = require('fs');
const { newId } = require('./id');
const { emit } = require('process');

// Registrations handler library
// Communicates with registrations.json file to add, remove, edit, and list registrations

module.exports = {
    // Add a registration
    add: function (discord_id, player) {
        let registrations = JSON.parse(fs.readFileSync('registration/registrations.json'));
        // Check if player is already registered
        let i = registrations.findIndex(r => r.player == player);
        if (i != -1) {
            emit('error', 'Player already registered');
            return false;
        }
        
        let id = newId();
        registrations.push({ id: id, discord_id: discord_id, player: player });
        fs.writeFileSync('registration/registrations.json', JSON.stringify(registrations));
        return id;
    },
    // Remove a registration
    remove: function (discord_id) {
        let registrations = JSON.parse(fs.readFileSync('registration/registrations.json'));
        //supprimer le joueur avec le discord_id
        let i = registrations.findIndex(r => r.discord_id == discord_id);
        if (i == -1) return false;
        registrations.splice(i, 1);
        fs.writeFileSync('registration/registrations.json', JSON.stringify(registrations));
        return true;
    },    
    // Edit a registration
    edit: function (discord_id, new_player) {
        let registrations = JSON.parse(fs.readFileSync('registration/registrations.json'));
        // Check if player is already registered
        let i = registrations.findIndex(r => r.player == new_player);
        if (i != -1) {
            emit('error', 'Player already registered');
            return false;
        }
        //modifier le joueur avec le discord_id
        let i2 = registrations.findIndex(r => r.discord_id == discord_id);
        if (i2 == -1) return false;
        registrations[i2].player = new_player;
        fs.writeFileSync('registration/registrations.json', JSON.stringify(registrations));
        return true;
    },
    // Get a registration
    get: function (discord_id) {
        let registrations = JSON.parse(fs.readFileSync('registration/registrations.json'));
        return registrations.find(r => r.discord_id == discord_id);
    },
    // Get a registration by player
    getByPlayer: function (player) {
        return registrations.find(r => r.player == player);
    },
    // List all registrations
    list: function () {
        return registrations;
    }
}