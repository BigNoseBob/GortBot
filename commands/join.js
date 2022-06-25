// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { joinVoiceChannel, createAudioPlayer, VoiceConnectionStatus, AudioPlayerStatus, entersState } = require('@discordjs/voice')
const { search, youtube_dl } = require('../search_youtube')

module.exports = {

    data : new SlashCommandBuilder()
        .setName('join')
        .setDescription('Pull Ralph into your voice channel'),
    async execute({ interaction, client, noreply }) {

        // set constants and grab the current voice channel user is in
        const channel = interaction.member.voice.channel
        if (!channel) throw new Error('RalphError', { cause: 'No voice channel found' })

        // Join the voice channel
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        })
        if (!connection) throw new Error('RalphError', { cause: 'Failed to join channel' })

        // Create and subscribe the audio player
        let player = createAudioPlayer()
        connection.subscribe(player)

        // Set the qeue to be empty and attach the player object
        client.audioconnections.set(channel.guild.id, [player, []] )

        // When the player idles, kick it into gear.
        let timeout
        player.on(AudioPlayerStatus.Idle, async () => {

            // Start auto disconnect timeout
            timeout = setTimeout(() => {
                try {
                    connection.destroy()
                } catch (err) {
                    // Don't really know what to do with this error yet so I'm just gonna log it
                    console.error(err)
                }
                client.audioconnections.delete(channel.guild.id)
            }, 120000)
            
            let [player, queue] = client.audioconnections.get(channel.guild.id)

            if (queue.length > 0) {

                // Clear the timeout
                clearTimeout(timeout)

                let snippet = queue.shift()
                if (typeof snippet == 'string') { // So playlists don't bust the quota right away
                    let data = await search({ query: snippet })
                    if (data.items.length === 0) throw new Error('RalphError', { cause: 'No videos found' })
                    snippet = data.items[0]
                }
                client.audioconnections.set(channel.guild.id, [player, queue])

                let url = `https://www.youtube.com/watch?v=${snippet.id.videoId}`

                let resource = await youtube_dl(url, { discord_resource: true, metadata: snippet })
                player.play(resource)

            }

        })

        player.on(AudioPlayerStatus.Playing, async () => {
            clearTimeout(timeout)
        })

        // hardcode hardcode hardcode hardcode hardcode hardcode hardcode hardcode
        player.on('error', err => {
            console.log('The audio player encountered an error')
            console.error(err)
            interaction.channel.send({ content: ':x: `Audio resource encountered an error`' })
        })

        connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
                // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                clearTimeout(timeout)
                connection.destroy();
            }
        });

        // Give the user confirmation on joining the channel
        if (noreply) return
        await interaction.reply({ content: `:sound: Successfully joined channel **${channel.name}**.` })

    }

}