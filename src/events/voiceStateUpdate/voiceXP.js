const { giveUserXP, getUserLevel } = require('../../utils/xpUtils');
const { pool: Level} = require('../../models/Level');

const currentVoiceUsers = new Map(); // Stores the userId with their intervals
const xpAwardInterval = 60000; // Awards xp every 60 seconds

function getRandomXp(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @param {Client} client
 * 
 */
module.exports = async (client, oldState, newState) => {
    const member = newState.member || oldState.member;
    const userId = member.id;

    if (!oldState.channelId && newState.channelId) {
        // They were not in a channel, and now they are. They have joined a vc.
        if (currentVoiceUsers.has(userId)) return; // Prevents starting multiple timers for the same user

        const interval = setInterval(async () => {
            const currentChannel = member.voice.channel;
            
            if (!currentChannel) {
                clearInterval(interval);
                currentVoiceUsers.delete(userId);
                return;
            }

            const realUsers = currentChannel.members.filter(
                m => !m.user.bot
            );

            if (realUsers.size < 2) return;

            const xpToGive = getRandomXp(15, 40);

            giveUserXP(member, oldState.guild.id, xpToGive);
            console.log(`${member.user.tag} earned ${xpToGive} voice XP`);
            
            await Level.execute(
                `
                UPDATE levels
                SET voiceTime = voiceTime + 1
                WHERE userId = ? AND guildId = ?
                `,
                [member.id, member.guild.id]
            );

        }, xpAwardInterval)

        currentVoiceUsers.set(userId, interval);
    }

    if (oldState.channelId && !newState.channelId) {
        if (currentVoiceUsers.has(userId)) {
            clearInterval(currentVoiceUsers.get(userId));
            currentVoiceUsers.delete(userId);
        }
    }
}