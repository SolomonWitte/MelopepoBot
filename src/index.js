const { Client, GatewayIntentBits, ActivityType } = require('discord.js')
const eventHandler = require('./handlers/eventHandler')

require('dotenv/config')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('s9_discord_bot_db', 'root', process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // idk
});

(async () => {
   try {
        await sequelize.authenticate();
        console.log("Connected to DB via Sequelize.");

        // This replaces "CREATE TABLE"
        await sequelize.sync(); 

        eventHandler(client);
        client.login(process.env.TOKEN);
   } catch (error) {
        console.log(`Database Error: ${error}`);
   }
})(); 
