// Oliver Rayner
// July 2022

// HTTP Server for managing requests send to bot

const http = require('http')
const fs = require('fs')
const config = JSON.parse(fs.readFileSync('./config.json'))
const API_ENDPOINTS = config.api_endpoints

async function HTTP_server(client, port=4078) {

    http.createServer(async (req, res) => {

        res.writeHead(200, {
            "Content-Type": 'text/json'
        })

        if (!API_ENDPOINTS.includes(req.url)) {
            res.end("Bad request")
        } else {
            let data;
            if (req.url === '/gort/guilds') {
                data = { cache: client.guilds.cache, size: client.guilds.cache.size }
            } else if (req.url === '/gort/users') {
                data = { cache: client.users.cache, size: client.users.cache.size }
            } else if (req.url === '/gort/voice') {
                data = { adapters: client.voice.adapters, size: client.voice.adapters.size }
            }
            res.end(JSON.stringify(data))
        }

    }).listen(port)
    console.log(`HTTP server listening on http://localhost:${port}`)

}


module.exports = {
    HTTP_server,
}


if (require.main === module) {
    HTTP_server()
}