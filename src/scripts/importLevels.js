const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits } = require("discord.js");
const { pool } = require("../models/Level");
const { updateLevelRoles } = require("../utils/xpUtils");

const guildId = "939354320015605801";

function parseNumber(str) {
    if (!str) return 0;
    str = str.toString().trim().toUpperCase();
    if (str.endsWith("K")) return Math.round(parseFloat(str) * 1000);
    return parseInt(str, 10);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

async function runImport() {
    await client.login(process.env.TOKEN);

    const guild = await client.guilds.fetch(guildId);
    await guild.members.fetch();

    const filePath = path.join(__dirname, "data.json");
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);

    for (const entry of data) {
        if (!entry.userId) continue;

        const userId = entry.userId;
        const messages = parseNumber(entry.messages);
        const xp = parseNumber(entry.xp);
        const level = parseInt(Math.floor(Math.sqrt(xp / 500)));

        // Insert/update DB
        await pool.execute(
            `INSERT INTO levels (userId, guildId, messages, xp, level)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                messages = VALUES(messages),
                xp = VALUES(xp),
                level = VALUES(level)`,
            [userId, guildId, messages, xp, level]
        );

        // Apply roles
        const member = guild.members.cache.get(userId);
        if (member) {
            await updateLevelRoles(member, level);
            console.log(`Updated ${entry.username} → Level ${level}`);
        } else {
            console.log(`Skipped ${entry.username} (not in guild)`);
        }
    }

    console.log("Import + role update complete.");
    process.exit(0);
}

runImport();
