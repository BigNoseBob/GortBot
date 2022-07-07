// Oliver Rayner
// July 2022

// Users endpoint. Returns all cached users

module.exports = {

    data: {
        name: "guilds",
        description: "Returns all cached guilds"
    },
    async execute({ client }) {
        return { cache: client.guilds.cache, size: client.guilds.cache.size }
    }

}