// Oliver Rayner
// April 2022

const global = process.argv[2] === '-g'
const DELETE_ALL = process.argv[2] === '-d'

const fs = require('node:fs')
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const axios = require('axios')

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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function delete_commands() {

	const headers = { "Authorization": `Bot ${token}` }
	const url = `https://discord.com/api/v10/applications/858698763585847317/commands`
	let res = await axios({ method: 'GET', responseType: 'json', url: url, headers: headers }).catch(err => console.error(err))
	let ids = res.data.map(item => item.id)

	let i = 0
	for (id of ids) {
		console.log(i)
		i++
		await axios({ method: 'DELETE', responseType: 'json', url: `https://discord.com/api/v10/applications/858698763585847317/commands/${id}`, headers: headers }).catch(err => console.error(err))
		await sleep(4000)
	}
	console.log('DONE')

}

if (DELETE_ALL) {
	delete_commands()
} else if (!global) {
	rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
		.then(() => console.log('Successfully registered guild application commands.'))
		.catch(console.error)
} else {
	rest.put(Routes.applicationCommands(clientId), { body: commands })
		.then(() => console.log('Successfully registered global application commands.'))
		.catch(console.error)
}

// console.log(`Successfully pushed \x1b[33m${commands.length}\x1b[0m items`)