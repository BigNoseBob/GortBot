// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice')
const ytdl = require('ytdl-core')
const youtubedl = require('youtube-dl-exec')
const { search } = require('../search_youtube')

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

            // Currently having some issues with this kicking off in the middle of playing a resource
            if (queue.length > 0) {
                
                // Update player and queue
                [player, queue, nowplaying] = client.audioconnections.get(channel.guild.id)

                let snippet = queue.shift()
                if (typeof snippet == 'string') { // So playlists don't bust the quota right away
                    let data = await search({ query: snippet })
                    if (data.items.length === 0) throw new Error('No videos found')
                    snippet = data.items[0]
                }
                client.audioconnections.set(channel.guild.id, [player, queue, snippet])

                console.log(snippet, typeof snippet == 'string', typeof snippet)

                let url = `https://www.youtube.com/watch?v=${snippet.id.videoId}`
                // let stream = await ytdl(url, {
                //     filter: format => format.itag == 251,
                //     highWaterMark: 40000,
                // })

                let stream = await youtubedl.exec(url, {
                    o: '-',
                    q: '',
                    f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                    r: '100k',
                }, {
                    stdio: ['ignore', 'pipe', 'ignore']
                }).stdout

                let info = await ytdl.getInfo(snippet.id.videoId);
                let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
                console.log(audioFormats)

                let resource = createAudioResource(stream, )
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