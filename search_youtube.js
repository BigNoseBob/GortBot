// Oliver Rayner
// June 2022

const axios = require('axios')
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


module.exports = {
    search
}


async function main() {
    
    let data = await search({ query: process.argv[2] || 'https://www.youtube.com/watch?v=GX3ENRaEPFU&ab_channel=Rschris6' })
    let items = data.items
    console.log(data)

    let urls = []
    for (let item of items) {
        urls.push(url_endpoint + item.id.videoId)
    }
    console.log(urls)

}

if (require.main === module) {
    main()
}