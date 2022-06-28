// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { user_top, refresh_token } = require('../spotify.js')
const { enqueue } = require('./play.js')

const fs = require('node:fs')

module.exports = {

    data : new SlashCommandBuilder()
        .setName('queuetop')
        .setDescription('Add your top spotify songs to the queue. Requires you to link your Spotify account through /link'),
    async execute({ interaction, client }) {

        const channel = interaction.member.voice.channel
        if (!channel) throw new Error('RalphError', { cause: 'No voice channel found' })

        // Grab token from local cache
        const user_data = JSON.parse(fs.readFileSync(`./users/${interaction.user.id}.json`))
        if (!user_data) throw new Error('RalphError', { cause: 'User has not linked Spotify account' })
        const access_token = user_data.access_token

        // Get the top songs from spotify
        let top_data
        try {
            top_data = await user_top(access_token, { type: 'tracks' })
        } catch (err) {
            // In this case we need to regenerate the access token
            let data = await refresh_token(access_token)
            fs.writeFileSync(`users/${interaction.user.id}.json`, JSON.stringify({ 
                access_token: data.access_token,
                refresh_token: data.refresh_token,
            }))

            top_data = await user_top(data.access_token, { type: 'tracks' })

        }
        let top_tracks = top_data.items.map(item => `${item.artists[0].name} - ${item.name}`)
        console.log(top_tracks)

        // Grab the audio player
        res = client.audioconnections.get(channel.guild.id)
        if (!res) {
            await require('./join.js').execute({ interaction, client, noreply: true });
        }
        [player, queue] = client.audioconnections.get(channel.guild.id)

        // Queue them
        await enqueue({ to_queue: top_tracks, embeds: null, queue: queue, player: player, interaction: interaction, force: false})


    }

}