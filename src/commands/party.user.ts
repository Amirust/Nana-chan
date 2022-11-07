import { Command } from '../types/Command';

import {ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, time} from 'discord.js';
import Party from '../structures/Party';

export const command: Command =
	{
		info: {
			name: 'user',
		},
		parentOf: 'party',
		async execute( interaction, rawlocale )
		{
			const errors = rawlocale.errors;
			const locale = rawlocale.commands[ `${this.parentOf}.${this.info.name}` ];

			let infopage: number = 0;

			const member = interaction.options.get( 'user' )?.member || interaction.member;
			// @ts-ignore
			await interaction.guild.members.fetch( member?.id );

			// Проверка на то есть ли партия у переданного юзера
			// @ts-ignore
			if ( !( await Party.isPartyMember( member.id ) ) )
			{
				// @ts-ignore
				return interaction.reply( { content: member.id === interaction.user.id ? locale.YouHasNoParty : locale.UserHasNoParty, ephemeral: true } );
			}

			const infoPrevFn = async ( i: ButtonInteraction ) =>
			{
				if ( i.user.id !== interaction.user?.id ) { return i.reply( { content: errors.InteractionNotForYou, ephemeral: true } ); }
				if ( !i.customId.startsWith( interaction.id ) ) { return; }

				if ( infopage > 0 )
				{
					infopage--;
					// @ts-ignore
					await renderPartyInfo( i );
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
					await renderPartyInfo( i );
				}
			};

			// @ts-ignore
			const party = await Party.get( member.id );
			// @ts-ignore
			if ( party?.status === 0 )
			{
				// @ts-ignore
				return interaction.reply( { content: member.id === interaction.user.id ? locale.YouHasNoParty : locale.UserHasNoParty, ephemeral: true } );
			}
			// @ts-ignore
			const renderPartyInfo = async ( i: ButtonInteraction ) =>
			{
				// @ts-ignore
				const info = await party.getInfo();

				let infoDescription = infopage === 0 ?
					// @ts-ignore
					locale.embed.description.format( [ time( new Date( party.date ), 'R' ), party.meta.course, info.reputationSum] ) :
					// @ts-ignore
					locale.embed.charter.format( [ party.meta.charter?.render() ] );
				// @ts-ignore
				if ( party.meta.privacy.has( 'Owner' ) && infopage !== 1 )
				{
					// @ts-ignore
					infoDescription += locale.embed.owner.format( [ `<@${party.owner}>` ] );
				}
				// @ts-ignore
				if ( party.meta.privacy.has( 'Members' ) && infopage !== 1 )
				{
					infoDescription +=
						locale.info.members.format(
							[
								info.reputation2members.length,
								info.reputation2members
									.map( m => `[${m.rep}] <@${m.id}>` )
									.join( ', ' )
							] ) + '\n';
				}

				if ( infopage !== 1 )
				{
					// @ts-ignore
					infoDescription += `\n${ party.meta.description.render() }`;
				}

				const row = new ActionRowBuilder();

				// @ts-ignore
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

				const embed = new EmbedBuilder()
					// @ts-ignore
					.setTitle( locale.embed.title.format( [ party.name ] ) )
					.setDescription( infoDescription )
					// @ts-ignore
					.setThumbnail( party.meta.icon )
					.setColor( bot.config.colors.embedBorder )
					// @ts-ignore
					.setFooter( { text: `ID: ${party.id}` } );

				return party?.meta.charter ?
					interaction.replied ?
						// @ts-ignore
						i.update( { embeds: [ embed ], components: [ row ] } ) :
						// @ts-ignore
						interaction.reply( { embeds: [ embed ], components: [ row ] } )
					:
					interaction.replied ?
						i.update( { embeds: [ embed ] } ) :
						interaction.reply( { embeds: [ embed ] } );
			};


			// @ts-ignore
			const message = await renderPartyInfo( interaction );

			const collector = await message.createMessageComponentCollector( {
				idle: 60000
			} );
			collector.on( 'end', ( collected, reason ) =>
			{
				if ( reason !== 'success' ) { interaction.deleteReply(); }
			} );

			collector.on( 'collect', async ( i: any ) =>
			{
				// Кнопачки пагинатора
				if ( i.customId === `${interaction.id}.party-info-prev` ) { await infoPrevFn( i ); }
				if ( i.customId === `${interaction.id}.party-info-next` ) { await infoNextFn( i ); }
			} );
		}
	};