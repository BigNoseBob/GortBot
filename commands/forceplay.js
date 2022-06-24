// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const play = require('./play.js')

module.exports = {

    data : new SlashCommandBuilder()
        .setName('forceplay')
        .setDescription('Searches YouTube for a song and immediately plays it')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Audio to look for on YouTube')
                .setRequired(true)
        ),
    async execute({ interaction, client }) {

        await play.execute({ interaction, client, force: true})

    }

}