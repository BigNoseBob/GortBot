// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { getVoiceConnection  } = require('@discordjs/voice')

module.exports = {

    data : new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Pull Ralph out of a voice channel'),
    async execute({ interaction, client }) {

        // set constants and grab the current voice channel user is in
        const channel = interaction.member.voice.channel

        if (!channel) return { content: 'bruh' }

        // Join the voice channel
        const connection = getVoiceConnection(channel.guild.id)
        connection.destroy()
        client.audioconnections.delete(channel.guild.id)

        // Give user confirmation on leaving the channel
        await interaction.reply({ content: `:dash: outta here **bitch**.` })

    }

}