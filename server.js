// Oliver Rayner
// June 2022

require('dotenv').config()

const http = require('node:http')
const fs = require('node:fs')
const querystring = require('node:querystring')
const { request_authorization } = require('./spotify.js')

async function main() {
	
    // HTTP Server
    const port = 8000
    let server = http.createServer(async (req, res) => {

        if (req.url.startsWith('/?code=')) {

            // console.log(req)
            res.writeHead(302, { 'Content-Type': 'text/html', location: 'https://brrr.money/' })

            let data = querystring.parse(req.url.substring(req.url.indexOf('?') + 1))
            let auth = await request_authorization({  
                grant_type: 'authorization_code', 
                code: data.code,
                redirect_uri: `http://ec2-3-22-234-91.us-east-2.compute.amazonaws.com:${port}`,
            })

            console.log(auth)

            fs.writeFileSync(`./users/${data.state}.json`, JSON.stringify({
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

    server.listen(port)
    console.log(`Listening on http://ec2-3-22-234-91.us-east-2.compute.amazonaws.com:${port}`)

}

if (require.main === module) {
    main()
}
