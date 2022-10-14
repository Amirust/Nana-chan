const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, time } = require('discord.js');

module.exports =
{
	info: {
        name: 'invite'
	},
    parentOf: 'marry',
	async execute( interaction, locale )
    {
        locale = locale.commands[ `${this.parentOf}.${this.info.name}` ];
        const member = interaction.options.get( 'user' )?.member;

        // Проверка на то есть ли у автора итерации активные запросы на женитьбу
        if ( bot.store.activeMarriesRequests.has( interaction.user.id ) )
        {
            const request = bot.store.activeMarriesRequests.get( interaction.user.id );
            if ( !request.createdAt + 1000 * 60 * 10 < Date.now() )
            {
                return interaction.reply({
                    content: locale.AlreadyHasRequest.format([ time( new Date(request.createdAt + 1000 * 60 * 10), 'R' ), `<@${member.user.id}>` ]), 
                    ephemeral: true
                });
            }
            else { bot.store.activeMarriesRequests.delete( interaction.user.id ) }
        }
        // Проверка на то есть ли предложения для участника переданного в аргументе user
        if ( bot.store.activeMarriesRequests.find( request => request.target === member.user.id ) ) { return interaction.reply({ content: locale.TargetAlreadyHasOffer.format([ `<@${member.user.id}>` ]), ephemeral: true }); }
        // Проверка на то указал ли автор итерации самого себя в аргументе user
		if ( member.user.id === interaction.user.id ) { return interaction.reply({ content: locale.CantLoveSelf, ephemeral: true }); }
        // Проверка на то бот ли участник переданный в аргументе user
        if ( member.user.bot ) { return interaction.reply({ content: locale.CantLoveBot, ephemeral: true }); }
        
        const collector = interaction.channel.createMessageComponentCollector({
            idle: 60000
        });
		collector.on( 'end', ( collected, reason ) =>
		{
			if ( reason !== 'success' ) { interaction.deleteReply(); }
		});

        bot.store.activeMarriesRequests.set( interaction.user.id, { createdAt: Date.now(), target: member.user.id } );

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag} ❤️ ${member.user.tag}` })
            .setColor( bot.config.colors.danger )
            .setDescription( locale.embed.description.format([ `<@${interaction.user.id}>`, `<@${member.user.id}>` ]) )

        const buttonAcceptFn = async ( i ) =>
        {
            if ( i.user.id !== member.user?.id ) { i.reply({ content: 'Не трогай то что не предназначено для тебя!', ephemeral: true }); }
            if ( !i.customId.startsWith( interaction.id ) ) { return; }
            collector.stop('success');

            embed.setDescription( locale.embed.descriptionAccepted.format([ `<@${interaction.user.id}>`, `<@${member.user.id}>` ]) );

            i.update({ embeds: [embed], components: [] });
        }

        const buttonRejectFn = ( i ) =>
        {
            if ( i.user.id !== member.user?.id ) { i.reply({ content: 'Не трогай то что не предназначено для тебя!', ephemeral: true }); }
            if ( !i.customId.startsWith( interaction.id ) ) { return; }
            collector.stop('success');

            embed.setAuthor({ name: `${interaction.user.tag} 💔 ${member.user.tag}` })
            embed.setDescription( locale.embed.descriptionRejected.format([ `<@${interaction.user.id}>`, `<@${member.user.id}>` ]) );

            i.update({ embeds: [embed], components: [] });
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId( `${interaction.id}.accept` )
                    .setStyle( 'Success' )
                    .setLabel( locale.buttons.accept )
                    .setAction( buttonAcceptFn, collector ),

                new ButtonBuilder()
                    .setCustomId( `${interaction.id}.reject` )
                    .setStyle( 'Danger' )
                    .setLabel( locale.buttons.reject )
                    .setAction( buttonRejectFn, collector )
            );        
        
        return interaction.reply({ embeds: [embed], components: [row] });
    }
};