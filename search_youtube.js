// Oliver Rayner
// June 2022

const { createAudioResource } = require('@discordjs/voice')
const axios = require('axios')
const youtubedl = require('youtube-dl-exec')
require('dotenv').config()

const endpoint = 'https://www.googleapis.com/youtube/v3'
const api_key = process.env.youtube_api_key
const url_endpoint = 'https://www.youtube.com/watch?v='


async function search({ query, urls }) {

    const url = `${endpoint}/search?part=snippet&type=video&q=${query}&key=${api_key}`
    let res = await axios({ method: 'GET', url: url, responseType: 'json' }).catch(err => console.error(err))

    if (urls) {
        if (!res.data.items) return
        let urls_arr = []
        for (let item of res.data.items) {
            urls_arr.push(url_endpoint + item.id.videoId)
        }
        return urls_arr
    }

    return res.data

}

async function content_details({ video_id }) {

    const url = `${endpoint}/videos?part=contentDetails&type=video&id=${video_id}&key=${api_key}`
    let res = await axios({ method: 'GET', url: url, responseType: 'json' }).catch(err => console.error(err))

    return res.data

}

async function youtube_dl(url, { discord_resource, metadata }) {
    
    // I got this chunk of code somewhere off stack overflow about a year ago (a year from June 2022)
    // and I would really like to understand what all theses options and stuff are...
    // https://github.com/ytdl-org/youtube-dl/blob/master/README.md#format-selection
    let stream = await youtubedl.exec(url, {
        o: '-',
        q: '',
        f: 'bestaudio[ext=webm]',
        // f: 'bestaudio[ext=webm+acodec=opus+asr=72000]/bestaudio',
        r: '100k',
        'buffer-size': 2048,
    }, {
        stdio: ['ignore', 'pipe', 'ignore']
    }).stdout

    if (discord_resource) {
        return createAudioResource(stream, {
            metadata: metadata
        })
    }
    return stream

}


module.exports = {
    search,
    content_details,
    youtube_dl,
}


async function main() {

    let data = await content_details({video_id: process.argv[2] || '1oeb9txGY8s'})
    console.log(data.items[0].contentDetails)

}

if (require.main === module) {
    main()
}