const { Client, GatewayIntentBits } = require('discord.js')
require('dotenv/config')

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

bot.on('clientReady', () => {
    console.log('The bot is ready')
})

bot.on('messageCreate', message => {

    // I'm dad response thing (very funny)

    if (message.author.id == bot.user.id) return
    imWord = null;
    if (message.content.toLowerCase().includes('i\'m')) {
        imWord = 'i\'m'
    } 
    if (message.content.toLowerCase().includes('im')) {
        imWord = 'im'
    } 
    if (imWord) {
        imIndex = message.content.indexOf('i\'m') || message.content.indexOf('im')
        message.reply('Hey' + message.content.slice(imIndex + imWord.length + 1) + ', I\'m Melopepo!')
    }
})

bot.login(process.env.TOKEN)