// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const fs = require('node:fs')

module.exports = {

    data : new SlashCommandBuilder()
        .setName('config')
        .setDescription('Regenerate the config file for this server'),
    async execute({ interaction, client }) {

        let config = { prefix: '!' }
        fs.writeFileSync(`guilds/${interaction.guildId}.json`, JSON.stringify(config))
        client.guildConfigs.set(interaction.guildId, config)

        interaction.reply({ content: `:hammer: \`Server config regenerated\`` })

    }

}