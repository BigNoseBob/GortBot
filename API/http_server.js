// Oliver Rayner
// July 2022

// HTTP Server for managing requests send to bot

const http = require('http')
const fs = require('fs')
const config = JSON.parse(fs.readFileSync('./config.json'))
const API_ENDPOINTS = config.api_endpoints

function load_endpoints(dir=__dirname + '/endpoints') {

    const endpoints = new Map()
    const endpoint_files = fs.readdirSync(`${dir}`).filter(file => file.endsWith('.js') && !file.startsWith('_'))
    for (let file of endpoint_files) {
        let endpoint = require(`${dir}/${file}`)
        endpoints.set(endpoint.data.name, endpoint)
    }
    return endpoints

}

function response_template({ status, code, data, message }) {

    status = status || "success"
    data = data || null
    message = message || null
    code = code || 200

    return { status: status, message: message, data: data }

}

async function HTTP_server(client, port=4078) {

    // Load endpoint responses
    const endpoints = load_endpoints()

    http.createServer(async (req, res) => {

        const endpoint = endpoints.get(API_ENDPOINTS[req.url])
        let data;
        if(!endpoint) {

            res.writeHead(404, {
                "Content-Type": 'text/json'
            })
            data = response_template({ status: "failure", code: 404, message: "Invalid API endpoint" })

        } else {

            res.writeHead(200, {
                "Content-Type": 'text/json'
            })
            let response_obj = await endpoint.execute({ client })
            data = response_template({ status: "success", code: 200, data: response_obj })

        }
        res.end(JSON.stringify(data))
        
    }).listen(port)
    console.log(`HTTP server listening on http://localhost:${port}`)

}


module.exports = {
    HTTP_server,
}


if (require.main === module) {
    HTTP_server()
}