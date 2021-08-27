require("dotenv").config();
const fs = require('fs');
const {
    Client,
    Collection,
    MessageEmbed,
    Message
} = require('discord.js');
const client = new Client();
client.commands = new Collection();
const disbut = require('discord-buttons')

disbut(client);

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log(`Le bot vient de démarrer.`);
    client.user.setActivity("World of Warcraft", {
        type: 'PLAYING'
    });
});

client.on('message', message => {
    if (message.content.charAt(0) != process.env.PREFIX || message.author.bot) return;
    const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) return;

    try {
        client.commands.get(command).execute(message, args, disbut);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.on('clickButton', async (button) => {
    const btnID = button.id;
    switch (btnID) {
        case 'postuler':
            await button.reply.send(`Un message privé t'a été envoyé !`, true)

            button.guild.members.fetch(button.clicker.id)
                .then(async membre => {
                    try {
                        let embed = new MessageEmbed()
                            .setColor('#5865F2')
                            .setTitle('Candidature')
                            .setDescription('Est-ce que tu es prêt(e) pour commencer?')

                        let candidatureOui = new disbut.MessageButton()
                            .setStyle('grey')
                            .setEmoji('864492580665032706')
                            .setLabel('Oui')
                            .setID('candidature_oui');

                        let candidatureNon = new disbut.MessageButton()
                            .setStyle('grey')
                            .setEmoji('864492580749443072')
                            .setLabel('Non')
                            .setID('candidature_non');

                        let buttons = new disbut.MessageActionRow()
                            .addComponents(candidatureOui, candidatureNon);

                        membre.send(embed, buttons);
                    } catch (e) {
                        console.log(e);
                    }
                });
            break;
        case 'candidature_oui':
            await button.reply.defer();
            const bcid = button.clicker.id;

            let candidatureOui = new disbut.MessageButton()
                .setStyle('grey')
                .setLabel('Questionnaire en cours')
                .setID('candidature_oui')
                .setDisabled();

            let embed = new MessageEmbed()
                .setColor('#5865F2')
                .setTitle('Candidature 1/6')
                .setDescription('Quel est ton Pseudo?');

            button.message.edit(embed, candidatureOui);

            let pseudo, classe, xp, motivation, raison, question;
            let count = 0;
            const filter = collector => collector.author.id === bcid;
            const collector = button.message.channel.createMessageCollector(filter, {
                max: 6,
                time: 60000,
                errors: ['time']
            })

            collector.on('collect', message => {
                count++
                switch (count) {
                    case 1:
                        pseudo = message.content;
                        embed.setTitle('Candidature 2/6').setDescription(`Quel est ta classe/spé?`)
                        button.message.edit(embed, candidatureOui);
                        break;
                    case 2:
                        classe = message.content;
                        embed.setTitle('Candidature 3/6').setDescription(`Quelle est ton expérience?`)
                        button.message.edit(embed, candidatureOui);
                        break;
                    case 3:
                        xp = message.content;
                        embed.setTitle('Candidature 4/6').setDescription(`Quelles sont tes motivations?`)
                        button.message.edit(embed, candidatureOui);
                        break;
                    case 4:
                        motivation = message.content;
                        embed.setTitle('Candidature 5/6').setDescription(`Pourquoi nous?`)
                        button.message.edit(embed, candidatureOui);
                        break;
                    case 5:
                        raison = message.content;
                        embed.setTitle('Candidature 6/6').setDescription(`Finir le palier Mythique de chaque raid est un impératif du jeu ?`)
                        button.message.edit(embed, candidatureOui);
                        break;
                    case 6:
                        question = message.content;
                        candidatureOui.setLabel('Candidature envoyée')
                        embed.setTitle('Candidature - FIN').setDescription(`🔰 **Résumé de tes réponses**\n*Pseudo*\n${pseudo}\n\n*Classe/spé*\n${classe}\n\n*Expérience*\n${xp}\n\n*Motivation*\n${motivation}\n\n*Pourquoi nous*\n${raison}\n\n*Finir le palier Mythique de chaque raid est un impératif du jeu ?*\n${question}\n\n\n🔰 **Ensuite**\nTa candidature a été transmise, tu seras notifié(e) par message privé lorsqu'une décision aura été prise.`)
                        button.message.edit(embed, candidatureOui);

                        // MESSAGE DANS LE SALON DES CV
                        const cvChannel = client.channels.resolve(process.env.CV_CHANNEL);

                        let candidatureEmbed = new MessageEmbed()
                            .setTitle(`Candidature de <@${message.author.id}>`)
                            .setColor('#5865F2')
                            .setDescription(`🔰 **Réponses**\n*Pseudo*\n${pseudo}\n\n*Classe/spé*\n${classe}\n\n*Expérience*\n${xp}\n\n*Motivation*\n${motivation}\n\n*Pourquoi nous*\n${raison}\n\n*Finir le palier Mythique de chaque raid est un impératif du jeu ?*\n${question}`)
                            .setFooter(message.author.id);

                        let candidatureAccepter = new disbut.MessageButton()
                            .setStyle('grey')
                            .setEmoji('864492580665032706')
                            .setLabel('Accepter')
                            .setID('candidature_accepter');

                        let candidatureRefuser = new disbut.MessageButton()
                            .setStyle('grey')
                            .setEmoji('864492580749443072')
                            .setLabel('Refuser')
                            .setID('candidature_refuser');

                        let buttons = new disbut.MessageActionRow()
                            .addComponents(candidatureAccepter, candidatureRefuser);

                        cvChannel.send(candidatureEmbed, buttons)
                        break;
                }
            })
            break;
        case 'candidature_accepter':
            await button.reply.defer();
            
            let cvEmbedAccepter = new MessageEmbed()
                .setTitle(button.message.embeds[0].title)
                .setColor(button.message.embeds[0].color)
                .setDescription(button.message.embeds[0].description)
                .setFooter(button.message.embeds[0].footer);

            let btnAccepter = new disbut.MessageButton()
                .setStyle('grey')
                .setEmoji('864492580665032706')
                .setLabel('Acceptée, le membre a été notifié par message privé.')
                .setID('candidature_accepter')
                .setDisabled();

            button.message.edit(cvEmbedAccepter, btnAccepter)

            button.guild.members.fetch(button.clicker.id)
                .then(async membre => {
                    try {
                        let embed = new MessageEmbed()
                            .setColor('#5865F2')
                            .setTitle('Retour candidature')
                            .setDescription('Ta candidature a été retenue ! <suite du texte>')

                        membre.send(embed);
                    } catch (e) {
                        console.log(e);
                    }
                });
            break;
        case 'candidature_refuser':
            await button.reply.defer();
            let cvEmbedRefuser = new MessageEmbed()
            .setTitle(button.message.embeds[0].title)
            .setColor(button.message.embeds[0].color)
            .setDescription(button.message.embeds[0].description)
            .setFooter(button.message.embeds[0].footer);

            let btnRefuser = new disbut.MessageButton()
                .setStyle('grey')
                .setEmoji('864492580749443072')
                .setLabel('Refusée, le membre a été notifié par message privé.')
                .setID('candidature_refuser')
                .setDisabled();

            button.message.edit(cvEmbedRefuser, btnRefuser)

            button.guild.members.fetch(button.clicker.id)
                .then(async membre => {
                    try {
                        let embed = new MessageEmbed()
                            .setColor('#5865F2')
                            .setTitle('Retour candidature')
                            .setDescription('Ta candidature a été rejetée. <suite du texte>')

                        membre.send(embed);
                    } catch (e) {
                        console.log(e);
                    }
                });
            break;
    }
});

client.login(process.env.client_TOKEN);