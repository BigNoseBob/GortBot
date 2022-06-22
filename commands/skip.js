// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { createAudioResource, AudioPlayerStatus } = require('@discordjs/voice')
const youtubedl = require('youtube-dl-exec')
const { search } = require('../search_youtube.js')

module.exports = {

    data : new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips to next audio resource in queue'),
    async execute({ interaction, client }) {

        // set constants and grab the current voice channel user is in
        const channel = interaction.member.voice.channel
        if (!channel) throw new Error('RalphError', { cause: 'No voice channel found' })

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
            let stream = await youtubedl.exec(url, {
                o: '-',
                q: '',
                f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                r: '100k',
            }, {
                stdio: ['ignore', 'pipe', 'ignore']
            }).stdout

            let resource = createAudioResource(stream, {
                metadata: upnext
            })
            player.play(resource)

            await interaction.reply({ content: ':track_next: Skipping...' })
        }

    }

}