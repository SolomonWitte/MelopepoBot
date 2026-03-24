const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js')

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */

    callback: async (client, interaction) => {
        const targetUserId = interaction.options.get('target-user').value;
        const reason = interaction.options.get('reason')?.value || "No reason provided.";

        await interaction.deferReply();

        const targetUser = await interaction.guild.members.fetch(targetUserId);

        if (!targetUser) {
            await interaction.editReply("That user doesn't exist in this server, yo.");
            return;
        }

        if (targetUser.id === interaction.guild.ownerId) {
            await interaction.editReply("Don't even try, pal.")
            return;
        }

        const targetUserRolePosition = targetUser.roles.highest.position;
        const requestUserRolePosition = interaction.member.roles.highest.position;
        const botRolePosition = interaction.guild.members.me.roles.highest.position;

        if (targetUserRolePosition >= requestUserRolePosition) {
            await interaction.editReply("You can't kick that user cuz they are better than you or lowk js like u.")
            return;
        }

        if (targetUserRolePosition >= botRolePosition) {
            await interaction.editReply("I'm not cool enough to kick that one... sorry. Figure it out yourself.")
            return;
        }

        try {
            await targetUser.kick(reason);
            await interaction.editReply(`User ${targetUser} was kicked.\nReason: ${reason}`);
        } catch (error) {
            console.log(`There was an error when kicking: ${error}`)
        }
    },

    name: 'kick',
    description: 'Kicks a member from the server.',
    // devOnly: Boolean,
    // testOnly: Boolean,
    options: [
        {
            name: 'target-user',
            description: 'The user to kick.',
            required: true,
            type: ApplicationCommandOptionType.Mentionable,
        },
        {
            name: 'reason',
            description: 'The reason for the kick.',
            type: ApplicationCommandOptionType.String,
        }
    ],
    permissionsRequired: [PermissionFlagsBits.KickMembers],
    botPermissions: [PermissionFlagsBits.KickMembers],
}