// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js')
const { AudioPlayerStatus } = require('@discordjs/voice')
const { search } = require('../search_youtube.js')

// Helper function
function *enumerate(array) {
    for (let i = 0; i < array.length; i++){
        yield [i, array[i]]
    }
}


module.exports = {

    data : new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows the current queue of media'),
    async execute({ interaction, client }) {

        // set constants and grab the current voice channel user is in
        const channel = interaction.member.voice.channel
        if (!channel) return { content: 'bruh' }

        [player, queue] = client.audioconnections.get(channel.guild.id)
        if (queue.length === 0) {
            interaction.reply('The queue is currently **empty**.')
            return
        }

        async function recursion(results_per_page, page_num = 0) {
            
            // Get the first 'x' results in the queue
            let results = queue.slice(page_num * results_per_page, (page_num + 1) * results_per_page)

            // create the embed
            let embed = new MessageEmbed().setColor('#D22B2B')
            let builder = ''

            for ([i, item] of enumerate(results)) {

                // This is hardcoded and will not work for recursion
                if ((!item.snippet || i != 0) && (page_num == 0)) {
                    if (i === 0) {
                        let res = await search({ query: item })
                        item = res.items[0]
                    } else {
                        builder += `${i + page_num + 1}. ${item}\n`
                        continue
                    }
                }

                let title = item.snippet.title || 'No video title found'
                let id = item.id.videoId || undefined
                let url = id? `https://www.youtube.com/watch?v=${id}` : 'No video URL found'
                let thumbnail_url = item.snippet.thumbnails.high.url || 'No thumbnail URL found'

                embed.setTitle(`:hourglass_flowing_sand: Up Next - ${title}`)
                embed.setDescription(url)
                embed.setThumbnail(thumbnail_url)

            }
            if (builder) embed.addField('Queue', builder)

            interaction.reply({ embeds: [embed] })


        }

        await recursion(5)


    }

}