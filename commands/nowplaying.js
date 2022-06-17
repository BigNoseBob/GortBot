// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { createAudioResource, AudioPlayerStatus } = require('@discordjs/voice')
const ytdl = require('ytdl-core')
const { search } = require('../search_youtube.js')

module.exports = {

    data : new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Shows currently playing media'),
    async execute({ interaction, client }) {

        // set constants and grab the current voice channel user is in
        const channel = interaction.member.voice.channel
        if (!channel) {
            
        }

        [player, queue, nowplaying] = client.audioconnections.get(channel.guild.id)
        

    }

}