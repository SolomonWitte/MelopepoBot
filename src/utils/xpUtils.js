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
                    members: [member.id],
                    roles: [],
                    parse: []
                 }
            });
        } catch (err) {
            console.error(`Error assigning level role to ${member.user.tag}:`, err);
        }
    }
}


module.exports = {levelRoles, updateLevelRoles}