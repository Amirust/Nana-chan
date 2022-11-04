import { Command } from '../types/Command';

import { EmbedBuilder } from 'discord.js';
import Marriage from '../structures/Marriage';
import Party from '../structures/Party';
import UserReputation from '../structures/UserReputation';

export const command: Command =
{
	info: {
		name: 'userinfo',
		description: 'Получить информацию о пользователе',
		options: [{
			name: 'user',
			description: 'Укажите пользователя',
			type: 6,
			required: false
		}]
	},
	async execute( interaction, locale )
	{
		locale = locale.commands[ this.info.name ];

		const member = interaction.options.get( 'user' )?.member || interaction.member;

		// @ts-ignore
		const marriage = await Marriage.get( member.id );
		// @ts-ignore
		let party = await Party.get( member.id );
		// @ts-ignore
		if ( party.status === 0 )
		{
			party = null;
		}
		// @ts-ignore
		const reputation = await UserReputation.get( member.id );

		let description = '';

		if ( marriage )
		{
			// @ts-ignore
			description += locale.embed.marryDescription.format( [ `<@${marriage.initializer === member.id ? marriage.target : marriage.initializer}>` ] );
		}

		if ( party )
		{
			// @ts-ignore
			description += locale.embed.partyDescription.format( [ party.name ] );
		}

		// @ts-ignore
		description += locale.embed.reputationDescription.format( [ reputation.reputation ] );

		const embed = new EmbedBuilder()
			// @ts-ignore
			.setAuthor( { name: member.user.tag, iconURL: member.user.avatarURL( { size: 256, dynamic: true } ) } )
			.setDescription( description )
			.setColor( bot.config.colors.embedBorder );

		return interaction.reply( { embeds: [embed] } );
	}
};