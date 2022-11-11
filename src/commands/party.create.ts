import { Command } from '../types/Command';

import {EmbedBuilder, GuildMemberRoleManager} from 'discord.js';
import Party from '../structures/Party';

export const command: Command =
{
	info: {
		name: 'create',
	},
	parentOf: 'party',
	async execute( interaction, rawlocale )
	{
		const locale = rawlocale.commands[ `${this.parentOf}.${this.info.name}` ];
		// @ts-ignore
		const name = interaction.options.getString( 'name' );

		// Проверка на то можно ли участнику создавать партии
		// @ts-ignore
		if ( !interaction.member?.roles.cache.has( '925061751572144199' ) ) { return interaction.reply( { content: locale.NoPermission, ephemeral: true } ); }
		// Проверка на то участник ли существующей партии автор итерации
		if ( await Party.isPartyMember( interaction.member.user.id ) ) { return interaction.reply( { content: locale.AlreadyInParty, ephemeral: true } ); }
		// Проверка на существование партии с таким именем
		if ( await Party.isNameOccupied( name ) ) { return interaction.reply( { content: locale.PartyNameOccupied, ephemeral: true } ); }

		const party = await Party.create( interaction.user.id, name );
		await ( interaction.member?.roles as GuildMemberRoleManager ).add( party.roleId );
		await party.save();

		const embed = new EmbedBuilder()
			.setTitle( locale.embed.title.format( [ name ] ) )
			.setDescription( locale.embed.description )
			.setColor( bot.config.colors.embedBorder )
			// @ts-ignore
			.setThumbnail( interaction.user.avatarURL( { size: 512, dynamic: true } ) );

		return interaction.reply( { embeds: [embed] } );
	}
};