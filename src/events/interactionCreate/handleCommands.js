const { ReactionUserManager } = require('discord.js');
const {} = require('../../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const localCommands = getLocalCommands();

    try {
        const commandObject = localCommands.find(
            (cmd) => cmd.name === interaction.commandName
        );

        if (!commandObject) return;

        if (commandObject.devOnly) {
            if (!MediaDevices.includes(interaction.member.id)) {
                interaction.reply({
                    content: 'Nuh uh.. you can\'t run this command IDIOT!',
                    ephemeral: true,
                });
                return;
            }
        }

        if (commandObject.testOnly) {
                if (!(interaction.guild.id === testServer)) {
                    interaction.reply({
                        content: 'Nuh uh.. you can\'t run this command IDIOT! (this ain\'t the place fo\' yo foolin)',
                        ephemeral: true,
                    });
                    return;
                }
        }
            
        if (commandObject.permissionsRequired?.length) {
            for (const permission of commandObject.permissionsRequired) {
                if (!interaction.member.permissions.has(permission)) {
                    interaction.reply({
                        content: 'Not enough permissions.',
                        ephemeral: true,
                });
                break;
                }
            }
        }

        if (commandObject.botPermissions?.length) {
            for (const permission of commandObject.botPermissions) {
                const bot = interaction.guild.members.me;

                if (!bot.permissions.has(permission)) {
                    interaction.reply({
                        content: "I don't have enough permissions for this task yo - Melopepo OUT!",
                        ephemeral: true,
                    })
                    break;
                }

            }
        }

        await commandObject.callback(client, interaction);
        
    } catch (error) {
        console.log(`There was an error running this command: ${error}`)
    }
}