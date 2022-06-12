// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { createAudioResource, AudioPlayerStatus } = require('@discordjs/voice')
const ytdl = require('ytdl-core')
const { search } = require('../search_youtube.js')

module.exports = {

    data : new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips to next audio resource in queue'),
    async execute({ interaction, client }) {

        // set constants and grab the current voice channel user is in
        const channel = interaction.member.voice.channel
        if (!channel) return { content: 'bruh' }

        let res = client.audioconnections.get(channel.guild.id)
        if (!res || res[0]._state.status === AudioPlayerStatus.Idle) {
            await interaction.reply({ content: `:x: Nothing to skip` })
        } else {
            [player, queue] = client.audioconnections.get(channel.guild.id)
            let upnext = queue.shift()

            // If the search wasn't immediate --> i.e. from a playlist
            if (!upnext.id) {
                let res = await search({ query: upnext })
                upnext = res.items[0]
            }

            let url = `https://www.youtube.com/watch?v=${upnext.id.videoId}`
            let stream = await ytdl(url, {
                filter: 'audioonly',
                quality: 'highestaudio',
            })
            let resource = createAudioResource(stream)
            player.play(resource)

            await interaction.reply({ content: ':fast_forward: Skipping...' })
        }

    }

}