// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js')
const { AudioPlayerStatus } = require('@discordjs/voice')

// Helper function
function *enumerate(array) {
    for (let i = 0; i < array.length; i++){
        yield [i, array[i]]
    }
}

module.exports = {

    data : new SlashCommandBuilder()
        .setName('clear')
        .setDescription('clears the queue of current media'),
    async execute({ interaction, client }) {

        // set constants and grab the current voice channel user is in
        const channel = interaction.member.voice.channel
        if (!channel) return { content: 'bruh' }

        [player, queue] = client.audioconnections.get(channel.guild.id)
        client.audioconnections.set(channel.guild.id, [player, []])
        interaction.reply(':broom: Cleared the queue.')

    }

}