// Oliver Rayner
// July 2022

// Users endpoint. Returns all cached users

module.exports = {

    data: {
        name: "users",
        description: "Returns all cached users"
    },
    async execute({ client }) {
        return { cache: client.users.cache, size: client.users.cache.size }
    }

}