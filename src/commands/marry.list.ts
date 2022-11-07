import { Command } from '../types/Command';

import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	time,
	ButtonInteraction,
	CommandInteraction,
	ButtonStyle
} from 'discord.js';
import Marriage from '../structures/Marriage';
import chunk from '../utils/chunk';

export const command: Command =
{
	info: {
		name: 'list'
	},
	parentOf: 'marry',
	async execute( interaction, rawlocale )
	{
		const errors = rawlocale.errors;
		const locale = rawlocale.commands[ `${this.parentOf}.${this.info.name}` ];
		const dbMarriages = await bot.db.collection( 'marriages' ).find().toArray();
		// @ts-ignore
		const marriages = dbMarriages.map( m => new Marriage( m ) );

		const message = await interaction.deferReply();

		const collector = await message.createMessageComponentCollector( {
			idle: 60000
		} );
		collector.on( 'end', ( collected, reason ) =>
		{
			if ( reason !== 'success' ) { interaction.deleteReply(); }
		} );

		let page = 0;
		const pages = chunk( marriages, 5 );

		const listPrevFn = async ( i: ButtonInteraction ) =>
		{
			if ( i.user.id !== interaction.user?.id ) { return i.reply( { content: errors.InteractionNotForYou, ephemeral: true } ); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }

			if ( page > 0 )
			{
				page--;
				await renderPage( i, true );
			}
		};

		const listNextFn = async ( i: ButtonInteraction ) =>
		{
			if ( i.user.id !== interaction.user?.id ) { return i.reply( { content: errors.InteractionNotForYou, ephemeral: true } ); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }

			if ( page < pages.length - 1 )
			{
				page++;
				await renderPage( i, true );
			}
		};

		const renderPage = async ( i: ButtonInteraction | CommandInteraction, isRerenderRequest = false ) =>
		{
			const buttonsRow = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId( `${interaction.id}.marry-list-prev` )
						.setEmoji( '⬅️' )
						.setStyle( ButtonStyle.Primary )
						.setDisabled( page === 0 ),

					new ButtonBuilder()
						.setCustomId( `${interaction.id}.marry-list-next` )
						.setEmoji( '➡️' )
						.setStyle( ButtonStyle.Primary )
						.setDisabled( page === pages.length - 1 )
				);

			// @ts-ignore
			let description = locale.embed.description.format( [ marriages.length ] );
			for ( const marriage of pages[page] )
			{
				if ( !marriage ) { break; }
				// @ts-ignore
				description += locale.embed.descriptionField.format( [ marriage.id, `<@${marriage.initializer}>`, `<@${marriage.target}>`, time( new Date( marriage.date ), 'R' ) ] );
			}

			const embed = new EmbedBuilder()
				// @ts-ignore
				.setTitle( locale.embed.title.format( [ interaction.guild.name ] ) )
				.setDescription( description )
				.setColor( bot.config.colors.embedBorder )
				// @ts-ignore
				.setThumbnail( interaction.guild.iconURL( { size: 512, dynamic: true } ) )
				.setFooter( { text: locale.embed.footer.format( [ page + 1, pages.length ] ) } );

			if ( pages.length > 1 )
			{
				if ( isRerenderRequest )
				{
					// @ts-ignore
					return i.update( { embeds: [embed], components: [buttonsRow] } );
				}
				return interaction.replied || interaction.deferred  ?
					// @ts-ignore
					await interaction.editReply( { embeds: [embed], components: [buttonsRow] } ) :
					// @ts-ignore
					await interaction.reply( { embeds: [embed], components: [buttonsRow] } );
			}
			else
			{
				if ( isRerenderRequest )
				{
					// @ts-ignore
					return i.update( { embeds: [embed] } );
				}
				return interaction.replied || interaction.deferred ?
					await interaction.editReply( { embeds: [embed] } ) :
					await interaction.reply( { embeds: [embed] } );
			}
		};

		collector.on( 'collect', async ( i: ButtonInteraction ) =>
		{
			// Кнопачки пагинатора
			if ( i.customId === `${interaction.id}.marry-list-prev` ) { await listPrevFn( i ); }
			if ( i.customId === `${interaction.id}.marry-list-next` ) { await listNextFn( i ); }
		} );

		// @ts-ignore
		await renderPage();
	}
};