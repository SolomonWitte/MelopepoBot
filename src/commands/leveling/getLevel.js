const { Client, Interaction, ApplicationCommandOptionType, AttachmentBuilder } = require('discord.js');
const { Font, RankCardBuilder } = require('canvacord');
const { calculateLevelXP } = require('../../utils/xpUtils')
const { pool: Level} = require('../../models/Level');
const path = require('path')

async function getUserLevel(userId, guildId) {
    const [rows] = await Level.execute(
        'SELECT * FROM levels WHERE userId = ? AND guildId = ?',
        [userId, guildId]
    );
    return rows[0] || null;
}

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        if (!interaction.inGuild()) {
            interaction.reply("You can only run this command inside the server, ya goof.");
            return;
        }

        await interaction.deferReply();

        const mentionedUserId = interaction.options.get('target-user')?.value;
        const targetUserId = mentionedUserId || interaction.member.id; // Defaults to the commander
        const targetUserObj = await interaction.guild.members.fetch(targetUserId);

        const fetchedLevel = await getUserLevel(targetUserId, interaction.guild.id);

        if (!fetchedLevel) {
            interaction.editReply(
                mentionedUserId ? `${targetUserObj.user.tag} basically just got here and is slacking off 
                and has done frickin jack squat so try again when they have chatted a bit more.` 
                : "You've done like NOTHING bro... why are you tryna check your levels. Get to chatting, pal. "
            );
            return;
        }

        // Get every user in server w/ level and xp
        const [allLevels] = await Level.execute(
            'SELECT userId, level, xp FROM levels WHERE guildId = ? ORDER BY level DESC, xp DESC',
            [interaction.guild.id]
        );

        const userData = allLevels.find(lvl => lvl.userId === targetUserId);
        const currentRank = allLevels.findIndex(lvl => lvl.userId === targetUserId) + 1;

        Font.loadDefault();

        const card = new RankCardBuilder()
            .setAvatar(targetUserObj.user.displayAvatarURL({ size: 1024 }))
            .setRank(currentRank)
            .setLevel(fetchedLevel.level)
            .setCurrentXP(fetchedLevel.xp)
            .setProgressCalculator((currentXP, requiredXP) => {
                return Math.floor(((currentXP - calculateLevelXP(fetchedLevel.level)) / (requiredXP - calculateLevelXP(fetchedLevel.level)) ) * 100);
            })
            .setRequiredXP(calculateLevelXP(fetchedLevel.level + 1))
            // .setStatus(targetUserObj.presence.status)
            .setUsername(targetUserObj.user.username)
            .setDisplayName(targetUserObj.user.displayName)
            .setBackground(path.join(__dirname, '../../assets/rankCardBG.png'))
            .setStyles({
                progressbar: {
                    thumb: {
                        style: {
                                // Direction 'to right' makes it flow horizontally
                                backgroundImage: "linear-gradient(to right, #f16034, #d6025a)",
                                // Ensure no background color is overriding it
                                backgroundColor: "transparent",
                        },
                    },
                },
                statistics: {
                    level: {
                        text: {
                            style: {
                                fontSize: "26px", // "LEVEL"
                            },
                        },
                        value: {
                            style: {
                                fontSize: "26px", // Actual level number
                                fontWeight: "700",
                            },
                        },
                    },

                    rank: {
                        text: {
                            style: {
                                fontSize: "26px", // "RANK:"
                            },
                        },
                        value: {
                            style: {
                                fontSize: "26px", // Actual rank number
                                fontWeight: "700",
                            },
                        },
                    },

                    xp: {
                        text: {
                            style: {
                                fontSize: "26px", // "XP:"
                            },
                        },
                        value: {
                            style: {
                                fontSize: "26px", // Current / required xp numbers
                                fontWeight: "700",
                            },
                        },
                    },
                },
            })

        const image = await card.build({ format: 'png',});
        const attachment = new AttachmentBuilder(image);
        interaction.editReply({ files: [attachment] });
    },

    name: 'level',
    description: "View your or a specified user's level and xp progress",
    aliases: ['rank'],
    options : [
        {
            name: 'target-user',
            description: "The user whose level you wish to see.",
            type: ApplicationCommandOptionType.Mentionable,
        }
    ]
}