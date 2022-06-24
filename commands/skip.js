// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { AudioPlayerStatus } = require('@discordjs/voice')
const { search, youtube_dl } = require('../search_youtube.js')

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
            throw new Error('RalphError', { cuase: 'Nothing to skip to' })
        } else {
            [player, queue] = client.audioconnections.get(channel.guild.id)
            let upnext = queue.shift()
            if (player.loop) queue.unshift(upnext)
            if (player.loopqueue) queue.push(upnext)

            // If the search wasn't immediate --> i.e. from a playlist
            if (!upnext.id) {
                let res = await search({ query: upnext })
                upnext = res.items[0]
            }

            let url = `https://www.youtube.com/watch?v=${upnext.id.videoId}`
            let resource = await youtube_dl(url, {discord_resource: true, metadata: upnext})
            player.play(resource)

            await interaction.reply({ content: ':track_next: Skipping...' })
        }

    }

}