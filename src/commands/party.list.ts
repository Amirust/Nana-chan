import { Command } from '../types/Command';

import {
	EmbedBuilder,
	ActionRowBuilder,
	SelectMenuBuilder,
	ButtonBuilder,
	time,
	ButtonInteraction,
	SelectMenuInteraction, ButtonStyle, CommandInteraction
} from 'discord.js';
import Party from '../structures/Party';
import UserReputation from'../structures/UserReputation';
import chunk from '../utils/chunk';

export const command: Command =
{
	info: {
		name: 'list'
	},
	parentOf: 'party',
	async execute( interaction, rawlocale )
	{
		const errors = rawlocale.errors;
		const locale = rawlocale.commands[ `${this.parentOf}.${this.info.name}` ];
		const dbParties = await bot.db.collection( 'parties' ).find().toArray();
		// @ts-ignore
		const parties = dbParties.filter( p => p.status !== 0 ).map( m => new Party( m ) );

		if ( parties.length <= 0 )
		{
			return interaction.reply( { content: locale.NoParties, ephemeral: true } );
		}

		const message = await interaction.deferReply();

		const collector = await message.createMessageComponentCollector( {
			idle: 60000
		} );
		collector.on( 'end', ( collected, reason ) =>
		{
			if ( reason !== 'success' ) { interaction.deleteReply(); }
		} );

		let page = 0;
		let infopage = 0;
		let infoparty: string | null = null;
		const pages = chunk( parties, 5 );

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

		const infoPrevFn = async ( i: ButtonInteraction ) =>
		{
			if ( i.user.id !== interaction.user?.id ) { return i.reply( { content: errors.InteractionNotForYou, ephemeral: true } ); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }

			if ( infopage > 0 )
			{
				infopage--;
				// @ts-ignore
				await renderPartyInfo( i, infoparty );
			}
		};

		const infoNextFn = async ( i: ButtonInteraction ) =>
		{
			if ( i.user.id !== interaction.user?.id ) { return i.reply( { content: errors.InteractionNotForYou, ephemeral: true } ); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }

			if ( infopage < 1 )
			{
				infopage++;
				// @ts-ignore
				await renderPartyInfo( i, infoparty );
			}
		};

		const buttonBackToListFn = async ( i: ButtonInteraction ) =>
		{
			if ( i.user.id !== interaction.user?.id ) { return i.reply( { content: errors.InteractionNotForYou, ephemeral: true } ); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }

			infoparty = null;
			infopage = 0;
			await renderPage( i, true );
		};

		const renderPartyInfo = async ( i: SelectMenuInteraction, pid?: string ) =>
		{
			const id = pid ? pid : i.values[0];
			const party = parties.find( p => p.id === id );
			if ( !party ) { return i.reply( { content: errors.NotFound, ephemeral: true } ); }
			infoparty = id;
			// @ts-ignore
			const members = party.members.concat( [ party.owner ] );

			const reputations = await UserReputation.getMany( members );
			const reputationSum = reputations.reduce( ( acc, cur ) => acc + Number( cur.reputation ), 0 );

			let infoDescription = infopage === 0 ?
				locale.info.description.format( [ time( new Date( party.date ), 'R' ), party.meta.course, reputationSum] ) :
				// @ts-ignore
				locale.info.charter.format( [ party.meta.charter?.render() ] );
			// @ts-ignore
			if ( party.meta.privacy.has( 'Owner' ) && infopage !== 1 )
			{
				infoDescription += locale.info.owner.format( [ `<@${party.owner}>` ] );
			}
			// @ts-ignore
			if ( party.meta.privacy.has( 'Members' ) && infopage !== 1 )
			{
				// @ts-ignore
				infoDescription +=
					locale.info.members.format(
						[
							members.length,
							members
								.map( m => ( { rep: reputations.find( rec => rec.id === m )?.reputation || 0, id: m } ) )
								.sort( ( a, b ) => b.rep - a.rep )
								.map( m => `[${m.rep}] <@${m.id}>` )
								.join( ', ' )
						] ) + '\n';
			}

			if ( infopage !== 1 )
			{
				// @ts-ignore
				infoDescription += `\n${ party.meta.description.render() }`;
			}

			const embed = new EmbedBuilder()
				.setTitle( locale.info.title.format( [ party.name ] ) )
				.setDescription( infoDescription )
				.setThumbnail( party.meta.icon )
				.setColor( bot.config.colors.embedBorder )
				.setFooter( { text: `ID: ${party.id}` } );

			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId( `${interaction.id}.back.to.list` )
						.setLabel( locale.info.back )
						.setStyle( ButtonStyle.Primary )
				);

			if ( party.meta.charter )
			{
				row.addComponents(
					new ButtonBuilder()
						.setCustomId( `${interaction.id}.party-info-prev` )
						.setEmoji( '⬅️' )
						.setStyle( ButtonStyle.Primary )
						.setDisabled( infopage === 0 ),

					new ButtonBuilder()
						.setCustomId( `${interaction.id}.party-info-next` )
						.setEmoji( '➡️' )
						.setStyle( ButtonStyle.Primary )
						.setDisabled( infopage === 1 )
				);
			}

			// @ts-ignore
			return i.update( { embeds: [embed], components: [row] } );
		};

		const renderPage = async ( i: ButtonInteraction | CommandInteraction, isRerenderRequest = false ) =>
		{
			let description = locale.embed.description.format( [ parties.length ] );

			for ( const party of pages[ page ] )
			{
				if ( !party ) { break; }
				const owner = await bot.client.users.fetch( party.owner );
				description += locale.embed.descriptionField.format( [ party.id, party.name, time( new Date( party.date ), 'R' ) ] );
				if ( party.meta.privacy.has( 'Owner' ) )
				{
					description += locale.embed.descriptionFieldOwner.format( [ `<@${owner.id}>` ] );
				}
				if ( party.meta.privacy.has( 'Members' ) )
				{
					description += locale.embed.descriptionFieldMembers.format( [ party.members.length + 1 ] );
				}
			}

			const embed = new EmbedBuilder()
				// @ts-ignore
				.setTitle( locale.embed.title.format( [ interaction.guild.name ] ) )
				.setDescription( description )
				.setColor( bot.config.colors.embedBorder )
				// @ts-ignore
				.setThumbnail( interaction.guild.iconURL( { size: 512, dynamic: true } ) )
				.setFooter( { text: locale.embed.footer.format( [ page + 1, pages.length ] ) } );

			const row = new ActionRowBuilder()
				.addComponents(
					new SelectMenuBuilder()
						.setCustomId( `${interaction.id}.party-list` )
						.setPlaceholder( locale.selectMenu.placeholder )
						.addOptions(
							pages[ page ].map( ( p ) =>
							{
								return {
									label: p.name,
									value: p.id,
									// @ts-ignore
									description: `${p.meta.privacy.has( 'Owner' ) ? locale.selectMenu.owner.format( [ `${ ( bot.client.users.cache.get( p.owner ) ).tag }` ] ) : ''}${p.meta.privacy.has( 'Owner' ) ? ' | ' : ''}${p.meta.privacy.has( 'Members' ) ? locale.selectMenu.members.format( [ p.members.length + 1 ] ) : ''}`,
									emoji: '🔱'
								};
							} )
						)
				);

			const buttonsRow = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId( `${interaction.id}.party-list-prev` )
						.setEmoji( '⬅️' )
						.setStyle( ButtonStyle.Primary )
						.setDisabled( page === 0 ),

					new ButtonBuilder()
						.setCustomId( `${interaction.id}.party-list-next` )
						.setEmoji( '➡️' )
						.setStyle( ButtonStyle.Primary )
						.setDisabled( page === pages.length - 1 )
				);

			if ( pages.length > 1 )
			{
				if ( isRerenderRequest )
				{
					// @ts-ignore
					return i.update( { embeds: [ embed ], components: [ row, buttonsRow ] } );
				}
				return interaction.replied || interaction.deferred  ?
					// @ts-ignore
					await interaction.editReply( { embeds: [embed], components: [row, buttonsRow] } ) :
					// @ts-ignore
					await interaction.reply( { embeds: [embed], components: [row, buttonsRow] } );
			}
			else
			{
				if ( isRerenderRequest )
				{
					// @ts-ignore
					return i.update( { embeds: [ embed ], components: [row] } );
				}
				return interaction.replied || interaction.deferred ?
					// @ts-ignore
					await interaction.editReply( { embeds: [embed], components: [row] } ) :
					// @ts-ignore
					await interaction.reply( { embeds: [embed], components: [row] } );
			}
		};

		collector.on( 'collect', async ( i: any ) =>
		{
			// Кнопачки пагинатора
			if ( i.customId === `${interaction.id}.party-list-prev` ) { await listPrevFn( i ); }
			if ( i.customId === `${interaction.id}.party-list-next` ) { await listNextFn( i ); }

			if ( i.customId === `${interaction.id}.party-info-prev` ) { await infoPrevFn( i ); }
			if ( i.customId === `${interaction.id}.party-info-next` ) { await infoNextFn( i ); }

			// Селект меню списка партий
			if ( i.customId === `${interaction.id}.party-list` ) { await renderPartyInfo( i ); }

			// Возврат из инфо
			if ( i.customId === `${interaction.id}.back.to.list` ) { await buttonBackToListFn( i ); }
		} );

		return renderPage( interaction );
	}
};