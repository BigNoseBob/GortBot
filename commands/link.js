// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const { user_authorization, request_authorization } = require('../spotify.js')
const axios = require('axios')

const http = require('node:http')
const fs = require('node:fs')
const querystring = require('node:querystring')

module.exports = {

    data : new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your Spotify account'),
    async execute({ interaction, client }) {

        const port = 8000
        const url = user_authorization({
            scopes: [ 'user-read-private', 'user-read-email', 'user-top-read' ],
            redirect_uri: `http://ec2-3-22-234-91.us-east-2.compute.amazonaws.com:${port}`
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

                console.log(req)
                res.writeHead(302, { 'Content-Type': 'text/html', location: 'https://brrr.money/' })

                let data = querystring.parse(req.url.substring(req.url.indexOf('?') + 1))
                let auth = await request_authorization({  
                    grant_type: 'authorization_code', 
                    code: data.code,
                    redirect_uri: `http://ec2-3-22-234-91.us-east-2.compute.amazonaws.com:${port}`,
                })

                console.log(auth)

                fs.writeFileSync(`./users/${interaction.user.id}.json`, JSON.stringify({
                    access_token: auth.access_token,
                    refresh_token: auth.refresh_token,
                }))
                res.end()

            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' })
                res.write('WRECK-IT')
                res.end()
            }

        })

        server.keepAliveTimeout(10_000)

        try {
            server.listen(port)
            console.log(`Listening on http://ec2-3-22-234-91.us-east-2.compute.amazonaws.com:${port}`)
        } catch (err) {
            // Port is already in use
        }

    }

}