module.exports = {
    name: 'ping',
    description: 'Replies with the ping of the bot.',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // options: Object[],
    // deleted: Boolean,

    callback: async (client, interaction) => {
        await interaction.deferReply();

        const reply = await interaction.fetchReply();
        const ping = reply.createdTimestamp - interaction.createdTimestamp;
        const wsPing = client.ws.ping

        interaction.editReply(`Pong! Client: ${ping}ms | Websocket: ${wsPing}`);
    }
}