// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice')
// const youtubedl = require('youtube-dl-exec')
const { search, youtube_dl } = require('../search_youtube')

module.exports = {

    data : new SlashCommandBuilder()
        .setName('join')
        .setDescription('Pull Ralph into your voice channel'),
    async execute({ interaction, client, noreply }) {

        // set constants and grab the current voice channel user is in
        const channel = interaction.member.voice.channel
        if (!channel) {
            interaction.reply('**404** Channel not found.')
            return
        }

        // Join the voice channel
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        })
        if (!connection) throw new Error('Failed to join channel')

        // Create and subscribe the audio player
        let player = createAudioPlayer()
        connection.subscribe(player)

        // Set the qeue to be empty and attach the player object
        client.audioconnections.set(channel.guild.id, [player, []] )

        // When the player idles, kick it into gear.
        player.on(AudioPlayerStatus.Idle, async () => {

            // Start auto disconnect timeout
            let timeout = setTimeout(() => {
                connection.destroy()
                client.audioconnections.delete(channel.guild.id)
            }, 120000)

            // Currently having some issues with this kicking off in the middle of playing a resource
            if (queue.length > 0) {

                // Clear the timeout
                clearTimeout(timeout)
                
                // Update player and queue
                [player, queue] = client.audioconnections.get(channel.guild.id)

                let snippet = queue.shift()
                if (typeof snippet == 'string') { // So playlists don't bust the quota right away
                    let data = await search({ query: snippet })
                    if (data.items.length === 0) throw new Error('No videos found')
                    snippet = data.items[0]
                }
                client.audioconnections.set(channel.guild.id, [player, queue])

                let url = `https://www.youtube.com/watch?v=${snippet.id.videoId}`

                let resource = await youtube_dl(url, { discord_resource: true, metadata: snippet })
                player.play(resource)

            }

        })

        // hardcode hardcode hardcode hardcode hardcode hardcode hardcode hardcode
        player.on('error', err => {
            console.log('The audio player encountered an error')
            console.error(err)
            // interaction.channel.send({ content: ':x: I ain\'t playing that shit you **degen**' })
            interaction.channel.send({ content: ':x: Audio resource encountered an error' })
        })

        // Give the user confirmation on joining the channel
        if (noreply) return
        await interaction.reply({ content: `:sound: Successfully joined channel **${channel.name}**.` })

    }

}