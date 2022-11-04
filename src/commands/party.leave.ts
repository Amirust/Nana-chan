import { Command } from '../types/Command';

import Party from '../structures/Party';

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

		// @ts-ignore
		const party = await Party.get( interaction.member.id );

		// @ts-ignore
		await party.removeMember( interaction.member.id );
		// @ts-ignore
		await interaction.member.roles.remove( party.roleId );

		// @ts-ignore
		await interaction.reply( { content: locale.Success.format( [ `<@${interaction.member.id}>`, party.name ] ) } );
	}
};