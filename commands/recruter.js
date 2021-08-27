const {
    MessageEmbed,
} = require('discord.js');

module.exports = {
    name: 'recruter',
    description: 'envoie le message de recrutement',
    execute(message, args, disbut) {
        message.delete();
        
        let embed = new MessageEmbed()
            .setColor('#5865F2')
            .setTitle('Recrutement ouvert !')
            .setDescription(args.join(' '));

        let btn = new disbut.MessageButton()
            .setStyle('blurple')
            .setLabel('🔎 Postuler')
            .setID('postuler');

        message.channel.send(embed, btn);
    },
};