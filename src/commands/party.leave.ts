import { Command } from '../types/Command';

import Party from '../structures/Party';
import { GuildMemberRoleManager } from 'discord.js';

export const command: Command =
{
	info: {
		name: 'leave',
	},
	parentOf: 'party',
	async execute( interaction, rawlocale )
	{
		const locale = rawlocale.commands[ `${this.parentOf}.${this.info.name}` ];

		// Проверка на то есть ли партия у пользователя
		if ( !( await Party.isPartyMember( interaction.user.id ) ) )
		{
			return interaction.reply( { content: locale.NoParty, ephemeral: true } );
		}

		// Проверка на владельца
		if ( await Party.isOwner( interaction.user.id ) )
		{
			return interaction.reply( { content: locale.YouOwner, ephemeral: true } );
		}

		const party = await Party.get( interaction.member!.user.id ) as Party;

		await party.removeMember( interaction.member!.user.id );
		await ( interaction.member!.roles as GuildMemberRoleManager ).remove( party.roleId );

		await interaction.reply( { content: locale.Success.format( [ `<@${interaction.member!.user.id}>`, party.name ] ) } );
	}
};