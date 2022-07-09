// Oliver Rayner
// June 2022

const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {

    data : new SlashCommandBuilder()
        .setName('buymeacoffee')
        .setDescription('Support ya mans'),
    async execute({ interaction }) {

        const url = 'https://www.buymeacoffee.com/oliverr'
        let embed = new MessageEmbed()
            .setColor('#edc92b')
            .setTitle('Support ya mans')
            .setDescription(`As you can probably infer, I drink **a lot** of coffee.\nClick [here](${url}) to spot me one.`)
            .setThumbnail('https://bmc-dev.s3.us-east-2.amazonaws.com/assets/icons/bmc_icon_black.png')

        interaction.reply({ embeds: [embed] })

    }

}