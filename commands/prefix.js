// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const fs = require('node:fs')

module.exports = {

    data : new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('set the server command prefix')
        .addStringOption(option =>
            option.setName('prefix')
                .setDescription('Set the server prefix')
                .setRequired(false)
        ),
    async execute({ interaction, client }) {

        let config = client.guildConfigs.get(interaction.guildId)
        if (!config) throw new Error('RalphError', { cause: `Config file for guild id ${interaction.guildId} does not exist. Run /config to generate one` })
        let prefix = interaction.options._hoistedOptions[0].value
        if (!prefix) throw new Error('RalphError', { cause: `Current prefix for guild id ${interaction.guildId} is \`${config.prefix}\`` })

        config.prefix = prefix
        fs.writeFileSync(`guilds/${interaction.guildId}.json`, JSON.stringify(config))

        interaction.reply({ content: `Server prefix for guild id ${interaction.guildId} changed to \`${prefix}\`` })

    }

}