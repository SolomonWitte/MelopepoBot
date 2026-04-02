const { ActivityType } = require('discord.js')

module.exports = async (client) => {
    client.user.setActivity({
            name: "FR4GM3NT",
            type: ActivityType.Streaming,
            url: 'https://www.youtube.com/watch?v=IFfLCuHSZ-U',
            author: "DenseMelon"
    })
}