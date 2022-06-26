// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const { user_authorization } = require('../spotify.js')

const http = require('node:http')
const fs = require('node:fs')

module.exports = {

    data : new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your Spotify account'),
    async execute({ interaction, client }) {

        const port = 8000
        const url = user_authorization({
            scopes: [ 'user-read-private', 'user-read-email', 'user-top-read' ],
            redirect_uri: `http://ec2-3-19-57-195.us-east-2.compute.amazonaws.com:${port}`
        })

        let embed = new MessageEmbed()
            .setColor('#00c04b')
            .setTitle('Link Your Spotify Account to RalphBot')
            .setDescription(`Don't worry, I won't do any sketchy shit.\nClick [here](${url}) to link your account.`)
            .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Spotify_App_Logo.svg/2048px-Spotify_App_Logo.svg.png')

        interaction.reply({ embeds: [embed], ephemeral: true })


        // HTTP Server
        let server = http.createServer(async (req, res) => {

            if (req.url.startsWith('/?code=')) {

                res.write('SUCCESS')

                let data = querystring.parse(req.url.substring(req.url.indexOf('?') + 1))
                console.log(data)

                fs.writeFileSync()
                res.end()
            } else {
                res.writeHead({ 'Content-Type': 'text/plain' })
                res.write('WRECK-IT')
                res.end()
            }

        })

        server.listen(port)
        

        console.log(`Listening on http://ec2-3-19-57-195.us-east-2.compute.amazonaws.com:${port}`)

    }

}