const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, time } = require('discord.js');
const Marriage = require('../structures/Marriage');

module.exports =
{
	info: {
		name: 'divorce'
	},
	parentOf: 'marry',
	async execute( interaction, locale )
	{
		rawlocale = locale;
		locale = locale.commands[ `${this.parentOf}.${this.info.name}` ];

		// Проверка на то женат ли автор итерации
		if ( !( await Marriage.isMarried( interaction.user.id ) ) )
		{
			return interaction.reply({
				content: locale.NotMarried,
				ephemeral: true
			});
		}
		// Проверка на то есть ли у автора итерации активные запросы на развод
		if ( bot.store.activeDivorcesRequests.has( interaction.user.id ) )
		{
			const request = bot.store.activeDivorcesRequests.get( interaction.user.id );
			if ( !request.createdAt + 1000 * 60 < Date.now() )
			{
				return interaction.reply({
					content: locale.AlreadyHasRequest.format([ time( new Date(request.createdAt + 1000 * 60), 'R' ) ]), 
					ephemeral: true
				});
			}
			else { bot.store.activeDivorcesRequests.delete( interaction.user.id ); }
		}

		const marriage = await Marriage.get( interaction.user.id );
		const member = await interaction.guild.members.fetch( marriage.initializer === interaction.user.id ? marriage.target : marriage.initializer );

		const collector = interaction.channel.createMessageComponentCollector({
			idle: 60000
		});
		collector.on( 'end', ( collected, reason ) =>
		{
			if ( reason !== 'success' ) { interaction.deleteReply(); }
		});

		bot.store.activeDivorcesRequests.set( interaction.user.id, { createdAt: Date.now(), target: member.user.id } );

		const embed = new EmbedBuilder()
			.setAuthor({ name: `${interaction.user.tag} 💔 ${member.user.tag}` })
			.setColor( bot.config.colors.danger )
			.setDescription( locale.embed.description.format([ `<@${interaction.user.id}>`, `<@${member.user.id}>` ]) );

		const buttonDivorceFn = async ( i ) =>
		{
			console.log(`${i.replied} | ${i.id}`);
			if ( i.user.id !== member.user?.id ) { return i.reply({ content: errors.InteractionNotForYou, ephemeral: true }); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }
			collector.stop('success');

			embed.setDescription( locale.embed.descriptionAccepted.format([ `<@${interaction.user.id}>`, `<@${member.user.id}>`, time( new Date(marriage.date), 'R' ) ]) );

			await marriage.delete();

			i.update({ embeds: [embed], components: [] });
		};

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId( `${interaction.id}.divorce` )
					.setStyle( 'Danger' )
					.setLabel( locale.buttons.divorce )
					.setAction( buttonDivorceFn, collector ),
			);
        
		return interaction.reply({ embeds: [embed], components: [row] });
	}
};