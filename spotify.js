// Oliver Rayner
// June 2022

// Spotify API wrapper for Ralph Discord bot

const axios = require('axios')

const endpoint = 'https://api.spotify.com/v1'
const CLIENT_ID = 'a34e4245fd0c48578f88ab9bb88c2374'
const CLIENT_SECRET = 'f42ffc8906a94471b5c9042e2716041a'

const headers = { 
    'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
    'Content-Type': 'application/x-www-form-urlencoded' 
}

async function request_authorization() {

    const url = 'https://accounts.spotify.com/api/token'
    let body = new URLSearchParams()
    body.append('grant_type', 'client_credentials')
    let res = await axios({ method: 'POST', url: url, responseType: 'json', headers: headers, data: body }).catch(err => console.error(err))
    return res.data

}

async function playlist(access_token, playlist_id) {

    const url = endpoint + `/playlists/${playlist_id}`
    let headers = { 'Authorization': `Bearer ${access_token}` }
    let res = await axios({ method: 'GET', url: url, headers: headers, responseType: 'json'}).catch(err => console.error(err))
    return res.data

}


module.exports = {
    request_authorization,
    playlist,
}

async function main() {

    let data = await request_authorization()
    let token = data.access_token
    console.log(token)

    // https://open.spotify.com/playlist/7lTdZqr7frwkdIML6mjuFD?si=c95e41d97a58426b
    let res = await playlist(token, '7lTdZqr7frwkdIML6mjuFD')
    console.log(res)

}

if (require.main === module) {
    main()
}
