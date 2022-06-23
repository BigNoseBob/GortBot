// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const { content_details } = require('../search_youtube.js')
const { decodeEntities } = require('../util.js')

module.exports = {

    data : new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Shows currently playing media'),
    async execute({ interaction, client }) {

        // set constants and grab the current voice channel user is in
        const channel = interaction.member.voice.channel
        if (!channel) throw new Error('RalphError', { cause: 'No voice channel found' })

        [player, queue] = client.audioconnections.get(channel.guild.id)
        let audio_resource = player._state.resource
        if (!audio_resource) throw new Error('RalphError', { cause: 'No media currently playing' })

        let nowplaying = audio_resource.metadata
        
        let title = nowplaying.snippet.title.replaceAll('&#39;', "'").replaceAll('&quot;', '"')
        let img_url = nowplaying.snippet.thumbnails.default.url
        let url = `https://www.youtube.com/watch?v=${nowplaying.id.videoId}`

        let data = await content_details({ video_id: nowplaying.id.videoId })
        let details = data.items[0].contentDetails
        let duration = details.duration.replace('PT', '').replace('M', 'm ').replace('S', 's')

        let playback_duration = player._state.resource.playbackDuration / 1000
        let playback_duration_minutes = Math.floor(playback_duration / 60)
        let playback_duration_seconds = Math.floor(playback_duration % 60)


        let embed = new MessageEmbed()
            .setColor('#D22B2B')
            .setTitle(':guitar: Now Playing - ' + decodeEntities(title))
            .setThumbnail(img_url)
            .setDescription(url + `\n${playback_duration_minutes}m ${playback_duration_seconds}s / ${duration}`)

        interaction.reply({ embeds: [embed] })

    }

}