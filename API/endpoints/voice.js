// Oliver Rayner
// July 2022

// Voice endpoint. Returns current number of voiceConnections

module.exports = {

    data: {
        name: "voice",
        description: "Returns current number of active voiceConnections"
    },
    async execute({ client }) {
        return { adapters: client.voice.adapters, size: client.voice.adapters.size }
    }

}