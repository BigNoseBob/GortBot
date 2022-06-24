// Oliver Rayner
// June 2022

// Remake of Gort
// Gort v0.2.0

const DiscordJS = require('discord.js')
const fs = require('fs')
const { enumerate } = require('./util.js')
const config = JSON.parse(fs.readFileSync('./config.json'))

COMMAND_PREFIX = config.prefix
COMMAND_ALIASES = config.aliases

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

    const TIME = process.argv.includes('-t')

    // Login and grab client
    const client = await login({ FLAGS : process.argv.includes('-f') })

    // Put commands onto the client
    client.commands = new DiscordJS.Collection()
    client.audioconnections = new DiscordJS.Collection()
    client.guildConfigs = new DiscordJS.Collection()

    const command_files = fs.readdirSync('./commands').filter(file => file.endsWith('.js') && !file.startsWith('_'))
    for (let file of command_files) {
        let cmd = require(`./commands/${file}`)
        client.commands.set(cmd.data.name, cmd)
    }

    const guild_configs = fs.readdirSync('./guilds').filter(file => file.endsWith('.json'))
    for (let file of guild_configs) {
        let config = JSON.parse(fs.readFileSync(`./guilds/${file}`))
        client.guildConfigs.set(file.substring(0, file.length - 5), config)
    }

    client.on('interactionCreate', async interaction => {

        if (!interaction.isCommand()) return
        let start_time = performance.now()

        const command = client.commands.get(interaction.commandName)
        if (!command) return

        try {
            await command.execute({ interaction, client })
        } catch (err) {
            if (err.message != 'RalphError') console.error(err)
            await interaction.reply({ content: `:x: \`${err.cause}\``, ephemeral: true })
        }

        let end_time = performance.now()
        if (TIME) console.log(`Execution of command \x1b[33m${interaction.commandName}\x1b[0m took \x1b[33m${Math.round(end_time - start_time)}ms\x1b[0m`)

    })

    client.on('messageCreate', async message => {

        let config = client.guildConfigs.get(message.guildId)
        if (!config) config = { prefix: '!' }       
        let prefix = config.prefix

        if (!message.content.startsWith(prefix)) return
        let start_time = performance.now()

        let args = message.content.substring(prefix.length).split(' ')
        let command_name = args[0]
        if (command_name in COMMAND_ALIASES) {
            command_name = COMMAND_ALIASES[command_name]
        }
        const command = client.commands.get(command_name)
        if (!command) return

        message.user = message.member.user
        message.commandName = command_name
        message.options = { _hoistedOptions: [] }
        for ([i, arg] of enumerate(args.slice(1))) {
            message.options._hoistedOptions[i] = { value: arg }
        }

        try {
            await command.execute({ interaction: message, client })
        } catch (err) {
            if (err.message != 'RalphError') console.error(err)
            await message.reply({ content: `:x: \`${err.cause}\``, ephemeral: true })
        }

        let end_time = performance.now()
        if (TIME) console.log(`Execution of command \x1b[33m${command_name}\x1b[0m took \x1b[33m${Math.round(end_time - start_time)}ms\x1b[0m`)

    })

}

if (require.main == module) {
    main()
}