// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const { user_authorization } = require('../spotify.js')

module.exports = {

    data : new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your Spotify account'),
    async execute({ interaction, client }) {

        const port = 8000
        const url = user_authorization({
            scopes: [ 'user-read-private', 'user-read-email', 'user-top-read' ],
            redirect_uri: `http://18.224.209.251:${port}`,
            state: interaction.user.id,
        })

        let embed = new MessageEmbed()
            .setColor('#00c04b')
            .setTitle('Link Your Spotify Account to RalphBot')
            .setDescription(`Don't worry, I won't do any sketchy shit.\nClick [here](${url}) to link your account.`)
            .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Spotify_App_Logo.svg/2048px-Spotify_App_Logo.svg.png')

        interaction.reply({ embeds: [embed], ephemeral: true })

    }

}