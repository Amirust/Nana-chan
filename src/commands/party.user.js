const { EmbedBuilder, time } = require('discord.js');
const Party = require('../structures/Party');

module.exports =
{
    info: {
        name: 'user',
    },
    parentOf: 'party',
    async execute( interaction, locale )
    {
        locale = locale.commands[ `${this.parentOf}.${this.info.name}` ];

        const member = interaction.options.get('user')?.member || interaction.member;
        await interaction.guild.members.fetch( member?.id );

        // Проверка на то есть ли партия у переданного юзера
        if ( !(await Party.isPartyMember( member.id )) )
        {
            return interaction.reply({ content: member.id === interaction.user.id ? locale.YouHasNoParty : locale.UserHasNoParty, ephemeral: true });
        }

        const party = await Party.get( member.id );

        let infoDescription = locale.embed.description.format([ time( new Date(party.date), 'R' ) ]);
        if ( party.meta.privacy.has('Owner') )
        {
            infoDescription += locale.embed.owner.format([ `<@${party.owner}>` ]);
        }
        if ( party.meta.privacy.has('Members') )
        {
            const members = party.members.concat([ party.owner ]);
            infoDescription += locale.embed.members.format([ members.length, members.map( m => `<@${m}>` ).join(', ') ]) + '\n';
        }

        infoDescription += `\n${ party.meta.description.render() }`;

        const embed = new EmbedBuilder()
            .setTitle( locale.embed.title.format([ party.name ]) )
            .setDescription( infoDescription )
            .setThumbnail( party.meta.icon )
            .setColor( bot.config.colors.embedBorder )
            .setFooter({ text: `ID: ${party.id}` });

        return await interaction.reply({ embeds: [embed] });
    }
};