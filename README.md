# About the project :
This project is basically a redo of my own old prohect [here](https://github.com/Darukity/MrBot-Discord-RCON)

This bot has many features and is used in my discord server with my twitch followers.

Principal features :
1. One discord channel connected to the minecraft chat.
2. Whitelist management with `/register` command.
3. See how many players are connected at any time in the "now playing" section of the bot.

And a lot more...

# Prerequire

You'll need node.js >=16.9.0 and npm >=9.2.0 installed on your machine to run the poject

# Installation :
```
# You need to create the bot folder in your minecraft server folder because he has to acces the logs folder :

tree ./ -L 2
./
├── DiscordBot
│   ├── README.md
│   ├── config.js
│   ├── main.js
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
    ...
├── debug
├── eula.txt
├── help.yml
├── libraries
├── logs
    └── latest.log
    ...

# Navigate into the server folder and enter the following commands

git clone git@github.com:Darukity/Minecraft-Discord-RCON.git

cd Minecraft-Discord-RCON

npm i
```
After the installation is complete you will need to create a config.js file into the bot folder the format is the folowing :
```javascript
module.exports = {
    token: '<your_discord_bot_token>',
    rcon_channel: '<your_rcon_channel_id>',
    register_channel: '<your_register_channel_id>',
    whitelisted_role_id: '<your_whitelisted_role_id>',
    mc_server_ip: '<your_minecraft_server_ip>',
    mc_server_port: <your_minecraft_server_port>,
    rcon_port: <your_rcon_port>,
    rcon_password: "<your_rcon_password>",
    discord_webhook_url: '<your_discord_webhook_url>',
    client_id: '<your_client_id>',
    minecraft_logs_file: '<path_to_your_minecraft_logs_file "lastest.log">',
}
```
The Rcon port and password can be seted up in the minecraft server configuration.

To start the bot you then have to run `npm start` in the console at the discord bot folder

Enjoy !