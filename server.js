// Oliver Rayner
// June 2022

require('dotenv').config()

const http = require('node:http')
const fs = require('node:fs')

async function main() {

    const PORT = 8000

    http.createServer(async (req, res) => {

        if (req.url.startsWith('/?code=')) {
            fs.writeFileSync()
            res.end()
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.write('WRECK-IT')
            res.end()
        }

    }).listen(PORT)

    console.log(`Listening on http://localhost:${PORT}`)

}

if (require.main === module) {
    main()
}