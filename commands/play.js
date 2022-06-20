// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { createAudioResource, AudioPlayer, AudioPlayerStatus } = require('@discordjs/voice')

const { MessageEmbed } = require('discord.js')
const { search, youtube_dl } = require('../search_youtube.js')
const { playlist, request_authorization } = require('../spotify.js')


function *enumerate(array) {
    for (let i = 0; i < array.length; i++){
        yield [i, array[i]]
    }
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
    async execute({ interaction, client }) {

        // set constants and grab the current voice channel user is in
        const channel = interaction.member.voice.channel
        const query = interaction.options._hoistedOptions[0].value
        if (!channel) {
            interaction.reply('**404** Channel not found.')
            return
        }

        let to_queue = [query]
        let is_playlist = false
        let playlist_title, playlist_owner_name, playlist_url, playlist_img_url, playlist_description

        // Check if it's a spotify playlist
        if (query.startsWith('https://open.spotify.com/playlist/')) {

            is_playlist = true
            let playlist_id = query.substring(query.indexOf('playlist/') + 9, query.indexOf('?'))
            
            // Get client-credentials authorization from Spotify Web API
            let response = await request_authorization()
            let playlist_res = await playlist(response.access_token, playlist_id)

            // Grab the titles from the spotify res
            let titles = playlist_res.tracks.items.map(item => `${item.track.name}, ${item.track.artists[0].name}`)
            to_queue = titles

            playlist_title = playlist_res.name
            playlist_owner_name = playlist_res.owner.display_name
            playlist_url = playlist_res.external_urls.spotify
            playlist_img_url = playlist_res.images[0].url

        }

        // grab voice channel and create a subscription to it
        res = client.audioconnections.get(channel.guild.id)
        if (!res) {
            await require('./join.js').execute({ interaction, client, noreply: true });
        }
        [player, queue] = client.audioconnections.get(channel.guild.id)

        async function enqueue({ query, immediate }) {

            if (immediate) {

                let data = await search({ query: query })
                if (data.items.length === 0) throw new Error('No videos found')
                let url = `https://www.youtube.com/watch?v=${data.items[0].id.videoId}`
            
                if (queue.length === 0 && player._state.status === AudioPlayerStatus.Idle) {
            
                    let resource = await youtube_dl(url, { discord_resource: true, metadata: data.items[0] })
                    player.play(resource)
            
                } else {
                    queue.push(data.items[0])   // Maybe want to attach the user object to this as well?
                }


                // Reply for when it is not a playlist
                if (!is_playlist) {

                    let item = data.items[0]

                    let title = item.snippet.title.replaceAll('&#39;', "'").replaceAll('&quot;', '"')
                    let img_url = item.snippet.thumbnails.default.url
                    let url = `https://www.youtube.com/watch?v=${item.id.videoId}`

                    let embed = new MessageEmbed()
                        .setColor('#D22B2B')
                        .setTitle(title)
                        .setThumbnail(img_url)
                        .setDescription(url)
                        .setAuthor({ name: interaction.user.username, iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png` })

                    await interaction.reply({ embeds: [embed] })

                } else {
                    
                    let embed = new MessageEmbed()
                        .setColor('#D22B2B')
                        .setTitle(playlist_title)
                        .setThumbnail(playlist_img_url)
                        .setDescription(playlist_description + `\n${playlist_url}?`)
                        .setAuthor({ name: interaction.user.username, iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png` })
                        .setFooter({ text: playlist_owner_name })

                    await interaction.reply({ embeds: [embed] }).catch(err => {})

                }

                

            } else {

                queue.push(query)

            }
        
        }

        for ([i, q] of enumerate(to_queue)) {
            if (i === 0 || i === 1) {
                await enqueue({ query: q, immediate: true })
            }
            else {
                await enqueue({ query: q, immediate: false })
            }
        }

        // if (is_playlist) {
        //     // Send the embed back
        //     let embed = make_embed(data.items[0], url)
        //     embed.setAuthor({ name: interaction.user.username, iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png` })
        //     await interaction.reply({ embeds: [embed] })
        // }

        // let item = queue[0]
        // let title = item.snippet.title.replaceAll('&#39;', "'")
        // let img_url = item.snippet.thumbnails.default.url
        // let url = `https://www.youtube.com/watch?v=${item.id.videoId}`

        // let embed = new MessageEmbed()
        //     .setColor('#D22B2B')
        //     .setTitle(title)
        //     .setThumbnail(img_url)
        //     .setDescription(url)
        //     .setAuthor({ name: interaction.user.username, iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png` })
        
        // await interaction.reply({ embeds: [embed] })

    }

}