const { testServer } = require('../../../config.json');
const getApplicationCommands = require('../../utils/getApplicationCommands');
const getLocalCommands = require('../../utils/getLocalCommands')
const areCommandsDifferent = require('../../utils/areCommandsDifferent')

module.exports = async (client) => {

    try {
        const localCommands = getLocalCommands();
        const applicationCommands = await getApplicationCommands(client, testServer);
        
        // Clear ALL guild commands
        // const guild = client.guilds.cache.get(testServer);
        // await guild.commands.set([]);
        // console.log("Cleared all guild commands.");

        for (const localCommand of localCommands) {
            const commandNames = [localCommand.name, ...(localCommand.aliases || [])];

            for (const name of commandNames) { // Handle aliases
                const { description, options, deleted } = localCommand;

                const existingCommand = await applicationCommands.cache.find(
                    (cmd) => cmd.name === name
                );

                if (existingCommand) {
                    if (deleted) {
                        await applicationCommands.delete(existingCommand.id);
                        console.log(`Deleted command "${name}".`);
                        continue;
                    }

                    if (areCommandsDifferent(existingCommand, { ...localCommand, name })) {
                        await applicationCommands.edit(existingCommand.id, {
                            description,
                            options,
                        });
                        console.log(`Edited command "${name}".`);
                    }
                } else {
                    if (deleted) continue;

                    await applicationCommands.create({
                        name,
                        description,
                        options,
                    });
                    console.log(`Registered command: "${name}".`);
                }
            }
        }

    } catch (error) {
        console.log(`There was an error: ${error}`)
    }
} 