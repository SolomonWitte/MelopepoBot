const { Client, GatewayIntentBits } = require('discord.js')
const { initializeDatabase } = require('./models/Level');
const eventHandler = require('./handlers/eventHandler')

require('dotenv/config')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

(async () => {
   try {
        await initializeDatabase(); // Did this weird but whatever yo
        eventHandler(client);

        client.login(process.env.TOKEN);
        
   } catch (error) {
        console.log(`Error: ${error}`)
   }
})();