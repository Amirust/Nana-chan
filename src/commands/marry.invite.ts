import { Command } from '../types/Command';
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, time, ButtonInteraction, ButtonStyle } from 'discord.js';
import Marriage from '../structures/Marriage';

export const command: Command =
{
	info: {
		name: 'invite'
	},
	parentOf: 'marry',
	async execute( interaction, rawlocale )
	{
		const errors = rawlocale.errors;
	 	const locale = rawlocale.commands[ `${this.parentOf}.${this.info.name}` ];
		const member = interaction.options.get( 'user' )?.member;
		// @ts-ignore
		await interaction.guild?.members.fetch( member?.id );

		// Проверка на то есть ли участник переданный в аргументе user на сервере
		if ( !member ) { return interaction.reply( { content: locale.NoUser, ephemeral: true } ); }
		// Проверка на то есть ли у автора итерации активные запросы на женитьбу
		if ( bot.store.activeMarriesRequests.has( interaction.user.id ) )
		{
			const request = bot.store.activeMarriesRequests.get( interaction.user.id );
			if ( request && !( request.createdAt + 1000 * 60 < Date.now() ) )
			{
				return interaction.reply( {
					content: locale.AlreadyHasRequest.format( [ time( new Date( request.createdAt + 1000 * 60 ), 'R' ), `<@${request.target}>` ] ), 
					ephemeral: true
				} );
			}
			else { bot.store.activeMarriesRequests.delete( interaction.user.id ); }
		}
		// Проверка на то женат ли автор итерации
		if ( await Marriage.isMarried( interaction.user.id ) )
		{
			return interaction.reply( {
				content: locale.YouAlreadyMarried,
				ephemeral: true
			} );
		}
		// Проверка на то женат ли участник переданный в аргументе user
		// @ts-ignore
		if ( await Marriage.isMarried( member.user.id ) )
		{
			return interaction.reply( {
				content: locale.TargetAlreadyMarried,
				ephemeral: true
			} ); 
		}
		// Проверка на то есть ли предложения для участника переданного в аргументе user
		// @ts-ignore
		if ( bot.store.activeMarriesRequests.find( request => request.target === member.user.id ) ) { return interaction.reply( { content: locale.TargetAlreadyHasOffer.format( [ `<@${member.user.id}>` ] ), ephemeral: true } ); }
		// Проверка на то указал ли автор итерации самого себя в аргументе user
		// @ts-ignore
		if ( member.user.id === interaction.user.id ) { return interaction.reply( { content: locale.CantLoveSelf, ephemeral: true } ); }
		// Проверка на то не Nana-chan ли передана в аргументе user
		// @ts-ignore
		if ( member.user.id === bot.client.user.id ) { return interaction.reply( { files: [ 'https://media.discordapp.net/attachments/1028698444388368495/1028698549447294986/Jg9M0Uo.gif' ], ephemeral: true } ); }
		// Проверка на то бот ли участник переданный в аргументе user
		// @ts-ignore
		if ( member.user.bot ) { return interaction.reply( { content: locale.CantLoveBot, ephemeral: true } ); }

		const collector = interaction.channel?.createMessageComponentCollector( {
			idle: 60000
		} );
		collector?.on( 'end', ( collected, reason ) =>
		{
			if ( reason !== 'success' ) { interaction.deleteReply(); }
		} );

		// @ts-ignore
		bot.store.activeMarriesRequests.set( interaction.user.id, { createdAt: Date.now(), target: member.user.id } );

		// @ts-ignore
		const { target } = bot.store.activeMarriesRequests.get( interaction.user.id );

		const embed = new EmbedBuilder()
			// @ts-ignore
			.setAuthor( { name: `${interaction.user.tag} ❤ ${member.user.tag}` } )
			.setColor( bot.config.colors.danger )
			// @ts-ignore
			.setDescription( locale.embed.description.format( [ `<@${interaction.user.id}>`, `<@${member.user.id}>` ] ) );

		const buttonAcceptFn = async ( i: ButtonInteraction ) =>
		{
			if ( i.user.id !== target ) { return await i.reply( { content: errors.InteractionNotForYou, ephemeral: true } ); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }
			collector?.stop( 'success' );

			// @ts-ignore
			const marriage = Marriage.create( { initializer: interaction.user.id, target: member.user.id } );
			await marriage.save();

			// @ts-ignore
			embed.setDescription( locale.embed.descriptionAccepted.format( [ `<@${interaction.user.id}>`, `<@${member.user.id}>` ] ) );

			bot.store.activeMarriesRequests.delete( interaction.user.id );
			i.update( { embeds: [embed], components: [] } );
		};

		const buttonRejectFn = ( i: ButtonInteraction ) =>
		{
			if ( i.user.id !== target ) { return i.reply( { content: errors.InteractionNotForYou, ephemeral: true } ); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }
			collector?.stop( 'success' );

			// @ts-ignore
			embed.setDescription( locale.embed.descriptionRejected.format( [ `<@${interaction.user.id}>`, `<@${member.user.id}>`,  ] ) );

			bot.store.activeMarriesRequests.delete( interaction.user.id );
			i.update( { embeds: [embed], components: [] } );
		};

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId( `${interaction.id}.accept` )
					.setStyle( ButtonStyle.Success )
					.setLabel( locale.buttons.accept )
					// @ts-ignore
					.setAction( buttonAcceptFn, collector ),

				new ButtonBuilder()
					.setCustomId( `${interaction.id}.reject` )
					.setStyle( ButtonStyle.Danger )
					.setLabel( locale.buttons.reject )
					// @ts-ignore
					.setAction( buttonRejectFn, collector )
			);
        
		// @ts-ignore
		return interaction.reply( { embeds: [embed], components: [row] } );
	}
};