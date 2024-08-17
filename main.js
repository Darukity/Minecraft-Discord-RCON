const Discord = require('discord.js')
const { EmbedBuilder, REST, Routes, ActivityType } = require('discord.js');
const bot = new Discord.Client({intents: 3276799})
const config = require('./config')
const commands = require('./commands')
const registrationManager = require('./registration/registration_manager')

const fs = require('fs');
const request = require('request');

const mcServer = require('minecraft-server-util');
const Rcon = require('rcon-client').Rcon;

const client = new Rcon({
  host: config.mc_server_ip,
  port: config.rcon_port,
  password: config.rcon_password,
});

const Tail = require('tail').Tail;
const tail = new Tail(config.minecraft_logs_file);

const webhookUrl = config.dicord_webhook_url;
const axios = require('axios')

//load {/} commands
const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(config.client_id), { body: commands.commandsList });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const prefix = "!"

bot.login(config.token)

bot.on("ready", async() => {
    console.log(`${bot.user.tag} est connecté`)
    tail.on('line', (line) => {
      // Filters
      if(line.split(" ").includes("RCON")) return;
      if(line.replace(/[\]/]/g, ' ').includes('WARN')) return;
      if(line.replace(/[\]/]/g, ' ').includes('voicechat')) return;
      if(line.includes("logged in with entity")) return;
      if(line.split(" ").includes("/tell")) return;
      if(line.split(" ").includes("/tp")) return;
      if(line.split(" ").includes("issued")) return;
      if(line.includes("Teleported")) return;
      if(line.includes("UUID")) return;
      if(line.includes("Disconnected")) return;
      newLine = line.replace(/\[Async Chat Thread - #\d+\/INFO\]: /, '')
      newLine = newLine.replace(/\[Server thread+\/INFO\]: /, '')

      axios.post(webhookUrl, { content: newLine })
      .then(response => {
          console.log('Message sent!');
      })
      .catch(error => {
          console.error(error);
      });
    });

    if(config.mc_server_ip != "127.0.0.1" && config.mc_server_ip != "localhost") {
      async function setStatus() {
          let status = 0;
          while(true){
            switch(status) {
              case 0: {
                mcServer.queryFull(config.mc_server_ip, config.mc_server_port)
                    .then((result) => {
                      parsedJSON = JSON.parse(JSON.stringify(result))
                      bot.user.setPresence({activities: [{type: ActivityType.Watching, name:`serveur mc: ${parsedJSON.players.online}/${parsedJSON.players.max} joueurs connectés`}]})
                      status = 1;
                    })
                    .catch((error) => console.error(error));
                  }
              case 1: {
                bot.user.setPresence({activities: [{type: ActivityType.Playing, name:`/help`}]})
                status = 0;
              }
            }
            await new Promise(resolve => setTimeout(resolve, 15000));
            //console.log(`updated`)
          }
        }
          setStatus()
    }
    else {
      bot.user.setPresence({activities: [{type: ActivityType.Playing, name:`executing on localhost try /help`}]})
    }

})

//{/} commands handle
bot.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const guild = bot.guilds.cache.get(interaction.guildId);
  const member = guild.members.cache.get(interaction.user.id);


  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
  if(interaction.commandName === 'players'){
    if(config.mc_server_ip != "127.0.0.1" && config.mc_server_ip != "localhost") {
      if(interaction.channelId != config.rcon_channel){
        mcServer.queryFull(config.mc_server_ip, config.mc_server_port)
        .then((result) => {
            parsedJSON = JSON.parse(JSON.stringify(result))
            message = "";
            players = parsedJSON.players.list;

            if(players[0] != undefined){
                for(let i=0;i<players.length; i++){
                    message += players[i];
                    if(i != players.length-1){
                        message += ", "
                    }
                }
                interaction.reply(`Liste des joueurs: ${message}`)
            } else {
              interaction.reply(`Aucun joueur n'est connecté`)
            }        
        })
        .catch((error) => console.error(error));
      }
    }
    else {
      interaction.reply(`La commande ne fonctionne pas sur localhost`)
    }
  }

  if(interaction.commandName === 'register'){
    if(interaction.channelId === config.register_channel){
      try {
        registrationManager.add(interaction.user.id, interaction.options.get('player').value)
        interaction.reply(`Votre compte minecraft a été lié à votre compte discord`)
        
        //ajoute le joueur au serveur whitelist
        client.connect().then(() => {
          command = `whitelist add ${interaction.options.get('player').value}`
          client.send(command).then((res) => {
              console.log(res)
              client.end()
            }).catch((err) => {
            console.error(err)
            client.end()
          })
        }
        ).catch((error) => {
          console.error(`Failed to connect to Minecraft server via RCON: ${error}`)
        })

        //ajoute le role minecraft au joueur
        //trouver le role minecraft via l'id
        const role = guild.roles.cache.find(role => role.id === config.whitelisted_role_id);
        member.roles.add(role).catch(console.error);
      } catch (error) {
        if (error == 'Player already registered') {
          interaction.reply(`Ce compte minecraft est déjà lié à un compte discord`)
        } else {
          interaction.reply(`Une erreur est survenue contactez un administrateur: ${error}`)
        }
      }
    } else {
      interaction.reply(`Vous ne pouvez pas utiliser cette commande ici`)
    }
  }

  if(interaction.commandName === 'unregister'){
    if(interaction.channelId === config.register_channel){
      try {
        registrationManager.remove(interaction.user.id)
        interaction.reply(`Votre compte minecraft a été supprimé de votre compte discord`)
        
        //supprime le joueur du serveur whitelist
        client.connect().then(() => {
          command = `whitelist remove ${interaction.options.get('player').value}`
          client.send(command).then((res) => {
              console.log(res)
              client.end()
            }).catch((err) => {
            console.error(err)
            client.end()
          })
        }
        ).catch((error) => {
          console.error(`Failed to connect to Minecraft server via RCON: ${error}`)
        })

        //supprime le role minecraft au joueur
        //trouver le role minecraft via l'id
        const role = guild.roles.cache.find(role => role.id === config.whitelisted_role_id);
        member.roles.remove(role).catch(console.error);
      
      } catch (error) {
        interaction.reply(`Une erreur est survenue contactez un administrateur: ${error}`)
      }
    } else {
      interaction.reply(`Vous ne pouvez pas utiliser cette commande ici`)
    }
  }

  // if (interaction.commandName === 'edit') {
  //   if (interaction.channelId === config.register_channel) {
  //       try {
  //           // Supprime l'ancien joueur du serveur whitelist
  //           client.connect().then(() => {
  //               const registration = registrationManager.get(interaction.user.id);
  //               if (!registration) {
  //                   throw new Error("Aucune inscription trouvée pour cet utilisateur.");
  //               }

  //               const oldPlayer = registration.player;
  //               const command = `whitelist remove ${oldPlayer}`;
  //               client.send(command).then((res) => {
  //                   console.log(res);
  //                   client.end();
  //               }).catch((err) => {
  //                   console.error(err);
  //                   client.end();
  //               });
  //           }).catch((error) => {
  //               console.error(`Failed to connect to Minecraft server via RCON: ${error}`);
  //           });

  //           // Édition du joueur
  //           const newPlayer = interaction.options.get('player').value;
  //           const result = registrationManager.edit(interaction.user.id, newPlayer);

  //           if (!result) {
  //               throw new Error("Échec de l'édition de l'enregistrement.");
  //           }

  //           interaction.reply(`Votre compte Minecraft a été édité`);

  //           // Ajoute le nouveau joueur au serveur whitelist
  //           client.connect().then(() => {
  //               const command = `whitelist add ${newPlayer}`;
  //               client.send(command).then((res) => {
  //                   console.log(res);
  //                   client.end();
  //               }).catch((err) => {
  //                   console.error(err);
  //                   client.end();
  //               });
  //           }).catch((error) => {
  //               console.error(`Failed to connect to Minecraft server via RCON: ${error}`);
  //           });

  //       } catch (error) {
  //           interaction.reply(`Une erreur est survenue, contactez un administrateur: ${error.message}`);
  //       }
  //   } else {
  //       interaction.reply(`Vous ne pouvez pas utiliser cette commande ici`);
  //   }
  // }

  if(interaction.commandName === 'help'){
    const keys = Object.keys(commands.commandsList);
    var embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Liste des commandes')
    .addFields(
      commands.commandsList.map(command => ({
            name: command.name,
            value: command.description,
        }))
    );
    interaction.reply({embeds: [embed]})
  }

  if(interaction.commandName === 'source'){
    interaction.reply('voici le lien vers mon code source: https://github.com/Darukity/Minecraft-Discord-RCON')
  }

  if(interaction.commandName === 'roll'){
    if(interaction.options.get('int')){
      let res = randomIntFromZeroToInt(interaction.options.get('int').value)
      interaction.reply(`${interaction.user.username} a obtenu ${res} points`)
    } else {
      let res = randomIntFromZeroToInt(10)
      interaction.reply(`${interaction.user.username} a obtenu ${res} points`)
    }
  }
  
  function randomIntFromZeroToInt(int) {
    return Math.floor(Math.random() * (Math.abs(int) + 1));
  }

});

bot.on("messageCreate", async (msg) => {
    if(msg.author.id == bot.application.id){return}
    if(msg.webhookId) return;
    console.log(msg.content)

    //Rcon Console
    if(msg.channelId === config.rcon_channel) {
      if(!msg.content.startsWith(prefix)){
        const mcChatChannel = bot.channels.cache.get(config.rcon_channel)
        command = msg.content
        client.connect().then(() => {
          console.log('Connected to Minecraft server via RCON')
          // Envoie la commande "log" pour afficher les derniers messages de la console
          const now = new Date();

          // formater l'heure
          const hours = now.getHours().toString().padStart(2, '0');
          const minutes = now.getMinutes().toString().padStart(2, '0');
          const seconds = now.getSeconds().toString().padStart(2, '0');
          const timeString = `[${hours}:${minutes}:${seconds}]`;
          client.send(command).then((res) => {
              console.log(res)
              newRes = res.replace("/", '')
              axios.post(webhookUrl, { content: newRes.replace(/§./g, '').split('\n').map(
                line => {
                  if (!line == "") {
                    return `${timeString} ${line}`;
                  } else {
                    return line;
                  }
                }).join('\n') })
              .then(response => {
                  console.log('Message sent!');
              })
              .catch(error => {
                  console.error(error);
              });
              client.end()
            }).catch((err) => {
              console.error(err)
              mcChatChannel.send(err)
              client.end()
            })
        }).catch((error) => {
          console.error(`Failed to connect to Minecraft server via RCON: ${error}`)
        })
      }
    }
})