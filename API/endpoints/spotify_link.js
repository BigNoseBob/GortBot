// Oliver Rayner
// July 2022

// Spotify redirect URI

const fs = require('node:fs')
const querystring = require('node:querystring')
const axios = require('axios')
const { request_authorization } = require('../../spotify.js')

module.exports = {

    data: {
        name: "spotify_link",
        description: "Writes user token and refresh token to file"
    },
    async execute({ url, res }) {
        
        let data = querystring.parse(url.split('?')[1])
        console.log(data)

        let response = await request_authorization({ 
            grant_type: 'authorization_code', 
            code: data.code,
            redirect_uri: 'https://api.oliverr.dev/gort/spotify/link',
        })
        console.log(response)

        const json = JSON.stringify(response)

        fs.writeFile(`users/${data.state}.json`, json, () => {
            
        })

    }

}