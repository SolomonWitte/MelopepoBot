const {Client, Message} = require('discord.js');
const { pool: Level} = require('../../models/Level');
const calculateLevelXp = require('../../utils/calculateLevelXp')
const mysql = require('mysql2/promise');
const cooldowns = new Set();

const levelRoles = {
    1: "1030698176233099326",
    2: "1030698775385219152",
    3: "1030699493571698771",
    4: "1030699866592129085",
    5: "1190513921556234330",
    6: "1190514697821229158",
    7: "1190515097118974062",
    8: "1190515207169118260",
    9: "1190515289973072054",
    10: "1190520488624148530",
};

function getRandomXp(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get user's level data
async function getUserLevel(userId, guildId) {
    const [rows] = await Level.execute(
        'SELECT * FROM levels WHERE userId = ? AND guildId = ?',
        [userId, guildId]
    );
    return rows[0] || null;
}

/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 */
module.exports = async (client, message) => {
    
    //  vvv WHERE LEVEL UP MESSAGES ARE SENT! vvv //
    const levelsChannel = client.channels.cache.get("1043046038233153566");

    if (!message.inGuild() || message.author.bot || cooldowns.has(message.author.id)) return;

    const xpToGive = getRandomXp(15, 40);

    const query = {
        userId: message.author.id,
        guildId: message.guild.id,
    };

    try {
        const level = await getUserLevel(query.userId, query.guildId);

        // -- UPDATING DATABASE -- //
        if (level) { 

            let currentXp = level.xp += xpToGive;
            let currentLevel = level.level;
            let currentLevelXp = calculateLevelXp(level.level); // The level the user now has after xp addition

            // -- LEVELING UP!! -- //
            if (currentXp > currentLevelXp) { 
                currentLevel += 1;

                const roleId = levelRoles[currentLevel];
                if (roleId) {
                    try {
                        const role = message.guild.roles.cache.get(roleId);
                        if (!role) return;

                        // Remove old LVL roles
                        const oldRoles = Object.values(levelRoles)
                            .filter(id => message.member.roles.cache.has(id));
                        await message.member.roles.remove(oldRoles);

                        // Add new level role
                        await message.member.roles.add(role);

                        levelsChannel.send(
                            `Hey ${message.member}, you leveled up to level ${role}!`
                        );
                    } catch (err) {
                        console.error(`Error assigning level role to ${message.member.user.tag}:`, err);
                    }
                }
            }
            
            await Level.execute(
                'UPDATE levels SET xp = ?, level = ? WHERE userId = ? AND guildId = ?',
                [currentXp, currentLevel, query.userId, query.guildId]
            );

            cooldowns.add(message.author.id);
            setTimeout(() => {
                cooldowns.delete(message.author.id)
            }, 1)
        } else {
            // IF THE PLAYER DOES NOT HAVE ANY DATA STORED YET
            // (!level)
            // It kind of seems like the first message xp isn't being stored... 
            // but idk what's happening and it's not that big of a deal so idc atm
            await Level.execute(
                'INSERT INTO levels (userId, guildId, messages, xp, level) VALUES (?, ?, ?, ?, ?)',
                [query.userId, query.guildId, 1, xpToGive, 0]
            );
            console.log(`Inserted new level data for user ${query.userId} in guild ${query.guildId}`);
            
            cooldowns.add(message.author.id);
            setTimeout(() => {
                cooldowns.delete(message.author.id)
            }, 60000)
        }

        console.log(await getUserLevel(query.userId, query.guildId));

        
    } catch (error) {
        console.log(`Error giving xp: ${error}`)
    }
}