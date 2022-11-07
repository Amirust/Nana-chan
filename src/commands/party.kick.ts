import { Command } from '../types/Command';

import { EmbedBuilder } from 'discord.js';
import Party from '../structures/Party';

export const command: Command =
{
	info: {
		name: 'kick',
	},
	parentOf: 'party',
	async execute( interaction, rawlocale )
	{
		const errors = rawlocale.errors;
		const locale = rawlocale.commands[ `${this.parentOf}.${this.info.name}` ];

		const member = interaction.options.get( 'user' )?.member;
		// @ts-ignore
		await interaction.guild.members.fetch( member?.id );

		// Проверка на то есть ли пользователь на сервере
		if ( !member )
		{
			return interaction.reply( { content: errors.UserNotFound, ephemeral: true } );
		}
		// @ts-ignore
		if ( member.id === interaction.user.id )
		{
			return interaction.reply( { content: locale.DontKickSelf, ephemeral: true } );
		}
		// Проверка на то есть ли партия у пользователя
		if ( !( await Party.isOwner( interaction.user.id ) ) )
		{
			return interaction.reply( { content: locale.NoParty, ephemeral: true } );
		}

		// @ts-ignore
		const party = await Party.get( interaction.member.id );

		// Проверка на то являеться ли переданный юзер участником партии
		// @ts-ignore
		if ( !party.members.includes( member.id ) )
		{
			return interaction.reply( { content: locale.UserNoInParty, ephemeral: true } );
		}

		const embed = new EmbedBuilder()
			.setTitle( locale.embed.title )
			// @ts-ignore
			.setDescription( locale.embed.description.format( [ `<@${member.id}>`, `<@${interaction.user.id}>`, party.name ] ) )
			.setColor( bot.config.colors.embedBorder )
			// @ts-ignore
			.setThumbnail( party.meta.icon );

		// @ts-ignore
		await party.removeMember( member.id );
		// @ts-ignore
		await member.roles.remove( party.roleId );

		await interaction.reply( { embeds: [embed] } );
	}
};