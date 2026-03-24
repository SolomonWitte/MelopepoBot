const { Client, GatewayIntentBits, ActivityType } = require('discord.js')
const eventHandler = require('./handlers/eventHandler')
require('dotenv/config')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

eventHandler(client)



client.login(process.env.TOKEN)