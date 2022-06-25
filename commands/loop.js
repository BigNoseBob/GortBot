// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {

    data : new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Loops the currently playing media'),
    async execute({ interaction, client }) {

        // set constants and grab the current voice channel user is in
        const channel = interaction.member.voice.channel
        if (!channel) throw new Error('Voice channel not found')

        [player, queue] = client.audioconnections.get(channel.guild.id)
        if (player.loop) {
            player.loop = false
            await interaction.reply(':repeat: unlooping...')
            return
        }

        let audio_resource = player._state.resource
        if (!audio_resource) throw new Error('RalphError', { cause: 'No media currently playing' })

        let nowplaying = audio_resource.metadata
        
        queue.unshift(nowplaying)
        player.loop = true
        await interaction.reply(':repeat: looping...')

    }

}