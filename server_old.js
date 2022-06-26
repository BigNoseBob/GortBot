// Oliver Rayner
// June 2022

require('dotenv').config()

const { user_authorization, request_authorization, user_top } = require('./spotify.js')
const http = require('node:http')
const querystring = require('node:querystring')

async function main() {

    let auth_url = await user_authorization([ 'user-read-private', 'user-read-email', 'user-top-read' ])
    console.log(auth_url)
    const PORT = 8000

    http.createServer(async (request, response) => {

        if (request.url === "/") {
            response.writeHeader(302, {
                'Content-Type': 'text/html',
                location: auth_url,
            })
            response.end()
        } else if (request.url.startsWith('/?code=')) {
            let res = querystring.parse(request.url.substring(request.url.indexOf('?') + 1))
            console.log(res)

            let code = res.code
            let data = await request_authorization({ grant_type: 'authorization_code', code: code })
            console.log(data)
            
            let user_data = await user_top(data.access_token, { type: 'tracks' })
            
            let track_titles = user_data.items.map(item => item.name)
            console.log(track_titles)

            // let artist_names = user_data.items.map(artist => artist.name)
            // console.log(artist_names)

            response.end()
        }

    }).listen(PORT)

    console.log(`Listening on http://localhost:${PORT}`)

}

if (require.main === module) {
    main()
}