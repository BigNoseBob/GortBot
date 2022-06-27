// Oliver Rayner
// June 2022

// Spotify API wrapper for Ralph Discord bot

const axios = require('axios')
const querystring = require('node:querystring')

require('dotenv').config()

const CLIENT_ID = process.env.spotify_client_id
const CLIENT_SECRET = process.env.spotify_client_secret
const REDIRECT_URI = 'http://localhost:8000'

const headers = { 
    'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
    'Content-Type': 'application/x-www-form-urlencoded' 
}

async function request_authorization({ grant_type, code, refresh_token, redirect_uri }) {

    if (grant_type === 'authorization_code' && !code) 
        throw new Error('APICallError', { cause: 'grant_type "authorization_code" requires an authorization code' })

    if (grant_type === 'refresh_token' && !refresh_token)
        throw new Error('APICalError', { cause: 'grant type "refresh_token" requires a refresh_token to be supplied' })

    const url = 'https://accounts.spotify.com/api/token'
    let body = new URLSearchParams()
    body.append('grant_type', grant_type)
    if (code) {
        body.append('code', code)
        body.append('redirect_uri', redirect_uri)
    }
    if (refresh_token) {
        body.append('refresh_token', refresh_token)
    }
    let res = await axios({ method: 'POST', url: url, responseType: 'json', headers: headers, data: body }).catch(err => console.error(err))
    return res.data

}

async function playlist(access_token, playlist_id) {

    const url = 'https://api.spotify.com/v1' + `/playlists/${playlist_id}`
    let headers = { 'Authorization': `Bearer ${access_token}` }
    let res = await axios({ method: 'GET', url: url, headers: headers, responseType: 'json'}).catch(err => console.error(err))
    if (!res) throw new Error('RalphError', { cause: 'Playlist not found' })
    return res.data

}

function user_authorization({ scopes, redirect_uri }) {

    return 'https://accounts.spotify.com/authorize?' + querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scopes.join(' '),
        redirect_uri: redirect_uri,
    })

}

async function user_top(token, { type,  }) {

    if (!(type === 'artists' || type === 'tracks'))
        throw new Error('APICallError', { cause: '[type] must be either "artists" or "tracks"'})
    
    const url = `https://api.spotify.com/v1/me/top/${type}`
    let res = await axios({ method: 'GET', url: url, resopnseType: 'json', headers: {
        "Authorization" : `Bearer ${token}`,
        'Content-Type': 'application/json',
    } }).catch(err => console.error(err))
    
    return res.data

}

async function refresh_token(token) {

    let data = await request_authorization({ grant_type: 'refresh_token', refresh_token: token })
    return data

}


module.exports = {
    request_authorization,
    user_authorization,
    refresh_token,
    user_top,
    playlist,
}

async function main() {

}

if (require.main === module) {
    main()
}
