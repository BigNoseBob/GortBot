// Oliver Rayner
// June 2022

// Remake of Gort
// Gort v0.2.0

const DiscordJS = require('discord.js')
const fs = require('fs')

async function login({ FLAGS }) {
    
    require('dotenv').config()
    if (FLAGS) console.log(DiscordJS.Intents.FLAGS)

    // Create the client
    const client = new DiscordJS.Client({ intents: [1, 2, 128, 512, 4096] })    // Use -f to see all the flags
    await client.login(process.env.DISCORD_TOKEN)
    console.log(`Successfully logged in as ${client.user.tag} with ID: ${client.user.id}`)
    
    return client

}

async function main() {

    // Login and grab client
    const client = await login({ FLAGS : process.argv.includes('-f') })

    // Put commands onto the client
    client.commands = new DiscordJS.Collection()
    client.audioconnections = new DiscordJS.Collection()

    const command_files = fs.readdirSync('./commands').filter(file => file.endsWith('.js') && !file.startsWith('_'))
    for (let file of command_files) {
        let cmd = require(`./commands/${file}`)
        client.commands.set(cmd.data.name, cmd)
    }

    client.on('interactionCreate', async interaction => {

        if (!interaction.isCommand()) return

        const command = client.commands.get(interaction.commandName)
        if (!command) return

        try {
            await command.execute({ interaction, client })
        } catch (err) {
            console.error(err)
            await interaction.reply({ content: `:x: ${err.message}`, ephemeral: true })
        }

    })

}

if (require.main == module) {
    main()
}