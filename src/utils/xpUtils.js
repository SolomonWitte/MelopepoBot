const { pool: Level} = require('../models/Level');

// Level roles for each level
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

const maxLevel = 10; // Remember to update this if any more level roles are added.

// Get user's level data
async function getUserLevel(userId, guildId) {
    const [rows] = await Level.execute(
        'SELECT * FROM levels WHERE userId = ? AND guildId = ?',
        [userId, guildId]
    );
    return rows[0] || null;
}

function calculateLevelXP(level) {
    return Math.floor(500 * Math.pow(level, 2));
};

// Give user xp and update level accordingly
async function giveUserXP(member, guildId, xpToGive) {
    try {
        const level = await getUserLevel(member.id, guildId);

        // -- UPDATING DATABASE -- //
        if (level) { 

            let currentXp = level.xp += xpToGive;
            let currentLevel = level.level;
            let requiredXPForNextLevel = calculateLevelXP(level.level + 1);

            // -- LEVELING UP!! -- //
            if (currentXp > requiredXPForNextLevel) { 
                currentLevel += 1;

                updateLevelRoles(member, currentLevel);
            }
            
            await Level.execute(
                'UPDATE levels SET xp = ?, level = ? WHERE userId = ? AND guildId = ?',
                [currentXp, currentLevel, member.id, guildId]
            );
            
        } else {
            // IF THE PLAYER DOES NOT HAVE ANY DATA STORED YET
            // (!level)
            // It kind of seems like the first message xp isn't being stored... 
            // but idk what's happening and it's not that big of a deal so idc atm
            await Level.execute(
                'INSERT INTO levels (userId, guildId, messages, xp, level) VALUES (?, ?, ?, ?, ?)',
                [member.id, guildId, 1, xpToGive, 0]
            );
            console.log(`Inserted new level data for user ${member.id} in guild ${guildId}`);
            
        }

        console.log(await getUserLevel(member.id, guildId)); // DELETE THIS

    } catch (error) {
        console.log(`Error giving xp: ${error}`)
    }
}

// Update the roles to be consistent with the member's current level
async function updateLevelRoles(member, levelToUpdateTo) {

    // Where level up messages are sent
    const levelsChannel = member.guild.channels.cache.get("1043046038233153566");

    if (levelToUpdateTo > maxLevel) levelToUpdateTo = maxLevel;

    const roleId = levelRoles[levelToUpdateTo];
    if (roleId) {
        try {
            const role = member.guild.roles.cache.get(roleId);
            if (!role) return;

            // Remove old LVL roles
            const oldRoles = Object.values(levelRoles).filter(id => member.roles.cache.has(id));
            await member.roles.remove(oldRoles);

            // Add new level role
            await member.roles.add(role);

            levelsChannel.send({
                content: `Hey ${member}, you are now level ${role}!`,
                allowedMentions: { 
                    parse: ['users']
                }
            });
        } catch (err) {
            console.error(`Error assigning level role to ${member.user.tag}:`, err);
        }
    }
}


module.exports = {levelRoles, calculateLevelXP, updateLevelRoles, getUserLevel, giveUserXP}