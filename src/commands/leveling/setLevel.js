const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { pool: Level} = require('../../models/Level');
const { permissionsRequired } = require('../moderation/timeout');
const { updateLevelRoles, calculateLevelXP } = require('../../utils/xpUtils');

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     * @returns 
     */
    callback: async (client, interaction) => {
        if (!interaction.inGuild()) {
            interaction.reply("You can only run this command inside the server, ya goof.");
            return;
        }

        await interaction.deferReply();

        const targetUserId = interaction.options.get('target-user').value;
        const targetUserObj = await interaction.guild.members.fetch(targetUserId);
        const targetLevel = interaction.options.get('target-level').value;
        let targetXp = calculateLevelXP(targetLevel);

        await Level.execute(
                'UPDATE levels SET xp = ?, level = ? WHERE userId = ? AND guildId = ?',
                [targetXp, targetLevel, targetUserId, interaction.guildId]
        );

        updateLevelRoles(targetUserObj, targetLevel)

        await interaction.editReply(`Set ${targetUserObj}'s level to ${targetLevel}!`);
    },

    name: 'set-level',
        description: "Set a user's level.",
        options : [
            {
                name: 'target-user',
                description: "The user whose level you wish to set.",
                type: ApplicationCommandOptionType.Mentionable,
                required: true,
            },
            {
                name: 'target-level',
                description: "The level to set the target-user to.",
                type: ApplicationCommandOptionType.Integer,
                required: true,
            }
        ],
        permissionsRequired: [PermissionFlagsBits.ManageRoles], // IDK WHAT WOULD BE BEST FOR THIS COMMAND
        botPermissions: [PermissionFlagsBits.ManageRoles],
}