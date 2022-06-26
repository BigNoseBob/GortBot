// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { AudioPlayerStatus } = require('@discordjs/voice')

const { MessageEmbed } = require('discord.js')
const { search, youtube_dl } = require('../search_youtube.js')
const { playlist, request_authorization } = require('../spotify.js')
const { enumerate, decodeEntities } = require('../util.js')


// For now only doing support for Spotify playlists
async function queue_playlist({ url, embed, interaction }) {

    if (embed && !interaction) throw new Error('SpotifyPlaylistCall', { cause: '[embed] field requires an Discord interaction to be provided' })

    // This could probably be cleaner
    let playlist_id = url.includes('?')? url.substring(url.indexOf('playlist/') + 9, url.indexOf('?')) : url.substring(url.indexOf('playlist/') + 9)

    let authorization_response = await request_authorization({ grant_type: 'client_credentials' })
    let res = await playlist(authorization_response.access_token, playlist_id)
    if (!res) throw new Error('RalphError', { cause: 'Missing Spotify playlist resolve' })

    // Format all the tracks in the playlist as "[artist name] - [track title]" in order to search on YT
    let tracks = res.tracks.items.map(item => `${item.track.artists[0].name} - ${item.track.name}`)
    if (!embed) return tracks

    let playlist_title = res.name || undefined
    let playlist_owner_name = res.owner.display_name || undefined
    let playlist_url = res.external_urls.spotify || undefined
    let playlist_img_url = res.images[0].url || undefined
    let playlist_description = res.description || undefined

    embed = new MessageEmbed()
        .setColor('#D22B2B')
        .setTitle(playlist_title)
        .setThumbnail(playlist_img_url)
        .setDescription(playlist_description + `\n${playlist_url}`)
        .setAuthor({ name: interaction.user.username, iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png` })
        .setFooter({ text: playlist_owner_name })

    return [ tracks, embed ]

}

async function queue_track({ query, queue, player, interaction, immediate, force }) {

    if (!immediate) { queue.push(query); return }  // Just push the track if we're not gonna do anything with it

    let data = await search({ query: query })
    if (data.items.length === 0) throw new Error('RalphError', { cause: 'results are **null**' })

    let url = `https://www.youtube.com/watch?v=${data.items[0].id.videoId}`
    if ((queue.length === 0 && player._state.status === AudioPlayerStatus.Idle) || force) {
        let resource = await youtube_dl(url, { discord_resource: true, metadata: data.items[0] })
        await player.play(resource)
    } else {
        queue.push(data.items[0])   // Maybe want to attach the user object to this as well?
    }

    let title = data.items[0].snippet.title.replaceAll('&#39;', "'").replaceAll('&quot;', '"')
    let img_url = data.items[0].snippet.thumbnails.default.url

    let embed = new MessageEmbed()
        .setColor('#D22B2B')
        .setTitle(decodeEntities(title))
        .setThumbnail(img_url)
        .setDescription(url)
        .setAuthor({ name: interaction.user.username, iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png` })

    return embed

}

// [to_queue] and [embeds] are arrays
async function enqueue({ to_queue, embeds, queue, player, interaction, force }) {

    let embed
    for ([i, q] of enumerate(to_queue)) {
        embed = await queue_track({ query: q, queue: queue, player: player, immediate: i === 0 || i === 1 || force, interaction: interaction, force: force })
    }
    interaction.reply({ embeds: embeds? embeds : [ embed ] })

}

module.exports = {

    data : new SlashCommandBuilder()
        .setName('play')
        .setDescription('Searches YouTube for a song')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Audio to look for on YouTube')
                .setRequired(true)
        ),
    async execute({ interaction, client, force }) {

        // set constants and grab the current voice channel user is in
        const channel = interaction.member.voice.channel
        if (!channel) throw new Error('RalphError', { cause: 'No voice channel found' })
        const option = interaction.options._hoistedOptions[0]
        if (!option) throw new Error('RalphError', { cause: 'A search query is required is execution of command \'play\'' })
        const query = option.value

        let to_queue = [ query ]
        let embed

        // Check if it's a spotify playlist
        if (query.startsWith('https://open.spotify.com/playlist/')) {
            [to_queue, embed] = await queue_playlist({ url: query, embed: true, interaction: interaction, force: force })
        }

        // grab voice channel and create a subscription to it
        res = client.audioconnections.get(channel.guild.id)
        if (!res) {
            await require('./join.js').execute({ interaction, client, noreply: true });
        }
        [player, queue] = client.audioconnections.get(channel.guild.id)

        await enqueue({ to_queue: to_queue, embeds: embed? [embed] : null, queue: queue, player: player, interaction: interaction, force: force})
    }

}