const {Client, Message} = require('discord.js');
const { pool: Level} = require('../../models/Level');
const { levelRoles, updateLevelRoles } = require('../../utils/xpUtils')
const calculateLevelXp = require('../../utils/calculateLevelXP')
const mysql = require('mysql2/promise');
const cooldowns = new Set();

const cooldownLength = 60000; // Cooldown between messages that give xp

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

    if (!message.inGuild() || message.author.bot || cooldowns.has(message.author.id)) return;

    const xpToGive = getRandomXp(15, 40);

    const query = {
        userId: message.author.id,
        guildId: message.guild.id,
        member: message.member
    };

    try {
        const level = await getUserLevel(query.userId, query.guildId);

        // -- UPDATING DATABASE -- //
        if (level) { 

            let currentXp = level.xp += xpToGive;
            let currentLevel = level.level;
            let requiredXPForNextLevel = calculateLevelXp(level.level + 1);

            // -- LEVELING UP!! -- //
            if (currentXp > requiredXPForNextLevel) { 
                currentLevel += 1;

                updateLevelRoles(query.member, currentLevel);
            }
            
            await Level.execute(
                'UPDATE levels SET xp = ?, level = ? WHERE userId = ? AND guildId = ?',
                [currentXp, currentLevel, query.userId, query.guildId]
            );

            cooldowns.add(message.author.id);
            setTimeout(() => {
                cooldowns.delete(message.author.id)
            }, cooldownLength)
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
            }, cooldownLength)
        }

        console.log(await getUserLevel(query.userId, query.guildId));

        
    } catch (error) {
        console.log(`Error giving xp: ${error}`)
    }
}