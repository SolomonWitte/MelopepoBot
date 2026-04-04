const {Client, Message} = require('discord.js');
const { pool: Level} = require('../../models/Level');
const { giveUserXP } = require('../../utils/xpUtils')

const mysql = require('mysql2/promise');
const cooldowns = new Set();

const cooldownLength = 60000; // Cooldown between messages that give xp

function getRandomXp(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 */
module.exports = async (client, message) => {

    if (!message.inGuild() || message.author.bot || cooldowns.has(message.author.id)) return;

    const xpToGive = getRandomXp(15, 40); 
    // I was considering moving this under giveUserXP as well, but idk maybe I'll want to change message XP increments independent of vc xp increments

    const query = {
        userId: message.author.id,
        guildId: message.guild.id,
        member: message.member
    };

    giveUserXP(query.member, query.guildId, xpToGive)
    
    cooldowns.add(query.userId);
    setTimeout(() => {
        cooldowns.delete(query.userId)
    }, cooldownLength)
}