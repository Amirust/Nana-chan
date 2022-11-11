import { Command } from '../types/Command';

import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	time,
	ButtonInteraction,
	ButtonStyle,
	GuildMember
} from 'discord.js';
import Party from '../structures/Party';

export const command: Command =
{
	info: {
		name: 'invite',
	},
	parentOf: 'party',
	async execute( interaction, rawlocale )
	{
		const errors = rawlocale.errors;
		const locale = rawlocale.commands[ `${this.parentOf}.${this.info.name}` ];

		const member = interaction.options.get( 'user' )?.member as GuildMember;
		// @ts-ignore
		await interaction.guild.members.fetch( member?.id );

		// Проверка на то есть ли пользователь на сервере
		if ( !member )
		{
			return interaction.reply( { content: errors.UserNotFound, ephemeral: true } );
		}
		if ( member.id === interaction.user.id )
		{
			return interaction.reply( { content: locale.DontInviteSelf, ephemeral: true } );
		}
		// Проверка на то бот ли переданный юзер
		if ( member.user.bot )
		{
			return interaction.reply( { content: locale.BotIsNotAllowed, ephemeral: true } );
		}
		// Проверка на то есть ли партия у пользователя
		if ( !( await Party.isOwner( interaction.user.id ) ) )
		{
			return interaction.reply( { content: locale.NoParty, ephemeral: true } );
		}
		// Проверка на то есть ли партия у переданного юзера
		if ( await Party.isPartyMember( member.id ) )
		{
			return interaction.reply( { content: locale.UserHasParty, ephemeral: true } );
		}

		const party = await Party.get( interaction.member!.user.id ) as Party;
		if ( party.status === 0 )
		{
			return interaction.reply( { content: locale.NoParty, ephemeral: true } );
		}

		// Проверка на то не пригласили ли уже этого пользователя
		if ( bot.store.activePartyInvites.has( member.id ) )
		{
			const request = bot.store.activePartyInvites.get( member.id );
			if ( request && !( request.createdAt + 1000 * 60 < Date.now() ) )
			{
				if ( request.requester === party?.name )
					return interaction.reply( {
						content: locale.AlreadyHasRequestFromYou.format( [ time( new Date( request.createdAt + 1000 * 60 * 10 ), 'R' ) ] ), 
						ephemeral: true
					} );
				else
					return interaction.reply( {
						content: locale.AlreadyHasRequest.format( [ time( new Date( request.createdAt + 1000 * 60 * 10 ), 'R' ), request.requester ] ), 
						ephemeral: true
					} );
			}
			else { bot.store.activePartyInvites.delete( interaction.user.id ); }
		}

		const collector = interaction.channel?.createMessageComponentCollector( {
			idle: 1000 * 60 * 10
		} );
		collector?.on( 'end', ( collected, reason ) =>
		{
			if ( reason !== 'success' ) { interaction.deleteReply(); }
		} );

		// @ts-ignore
		bot.store.activePartyInvites.set( member.id, { createdAt: Date.now(), requester: party.name } );

		const embed = new EmbedBuilder()
			.setTitle( locale.embed.title )
			.setDescription( locale.embed.description.format( [ `<@${member.id}>`, `<@${interaction.user.id}>`, party.name ] ) )
			.setColor( bot.config.colors.embedBorder )
			.setThumbnail( party.meta.icon );

		const acceptFn = async ( i: ButtonInteraction ) =>
		{
			if ( i.user.id !== member.id ) { return i.reply( { content: errors.InteractionNotForYou, ephemeral: true } ); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }

			await party.addMember( member.id );
			embed.setDescription( locale.embed.accepted.format( [ `<@${member.id}>`, party.name ] ) );

			bot.store.activePartyInvites.delete( member.id );
			await member.roles.add( party.roleId );
			await i.update( { embeds: [embed], components: [] } );
		};

		const declineFn = async ( i: ButtonInteraction ) =>
		{
			if ( i.user.id !== member.id ) { return i.reply( { content: errors.InteractionNotForYou, ephemeral: true } ); }
			if ( !i.customId.startsWith( interaction.id ) ) { return; }

			embed.setDescription( locale.embed.declined.format( [ `<@${member.id}>`, party.name ] ) );

			bot.store.activePartyInvites.delete( member.id );
			await i.update( { embeds: [embed], components: [] } );
		};

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId( `${interaction.id}.invite.accept` )
					.setLabel( locale.embed.accept )
					.setStyle( ButtonStyle.Success )
					.setAction( acceptFn, collector ),

				new ButtonBuilder()
					.setCustomId( `${interaction.id}.invite.decline` )
					.setLabel( locale.embed.decline )
					.setStyle( ButtonStyle.Danger )
					.setAction( declineFn, collector )
			);

		// @ts-ignore
		await interaction.reply( { embeds: [embed], components: [row] } );
	}
};