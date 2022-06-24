// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { getVoiceConnection, entersState, VoiceConnectionStatus } = require('@discordjs/voice')

module.exports = {

    data : new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Pull Ralph out of a voice channel'),
    async execute({ interaction, client }) {

        // set constants and grab the current voice channel user is in
        const channel = interaction.member.voice.channel
        if (!channel) throw new Error('RalphError', { cause: 'No voice channel found' })

        // Join the voice channel
        const connection = getVoiceConnection(channel.guild.id)

        if (connection.state != VoiceConnectionStatus.Ready) {
            await entersState(connection, VoiceConnectionStatus.Ready, 5_000)
        }

        connection.destroy()
        client.audioconnections.delete(channel.guild.id)

        // Give user confirmation on leaving the channel
        await interaction.reply({ content: `:dash: outta here **bitch**.` })

    }

}