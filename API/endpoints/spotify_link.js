// Oliver Rayner
// July 2022

// Spotify redirect URI

const fs = require('node:fs')
const querystring = require('node:querystring')

module.exports = {

    data: {
        name: "spotify_link",
        description: "Writes user token and refresh token to file"
    },
    async execute({ url, res }) {
        
        let res = querystring.parse(url)
        const json = JSON.stringify(res)
        console.log(res)

        fs.writeFile(`users/${data.state}.json`, json)

    }

}