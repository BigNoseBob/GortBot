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
        let option = interaction.options._hoistedOptions[0]
        if (!option) {
            interaction.reply({ content: `:hammer: Current prefix for guild id ${interaction.guildId} is \`${config.prefix}\`` })
            return
        }

        config.prefix = option.value
        fs.writeFileSync(`guilds/${interaction.guildId}.json`, JSON.stringify(config))

        interaction.reply({ content: `:hammer: Server prefix changed to \`${option.value}\`` })

    }

}