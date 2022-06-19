// Oliver Rayner
// April 2022

const global = process.argv[2] === '-g'

const fs = require('node:fs')
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config()

const clientId = process.env.clientID
const guildId = process.env.guildID
const token = process.env.DISCORD_TOKEN

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

if (!global) {
	rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
		.then(() => console.log('Successfully registered guild application commands.'))
		.catch(console.error);
} else {
	rest.put(Routes.applicationCommands(clientId), { body: commands })
		.then(() => console.log('Successfully registered global application commands.'))
		.catch(console.error);
}

// console.log(`Successfully pushed \x1b[33m${commands.length}\x1b[0m items`)