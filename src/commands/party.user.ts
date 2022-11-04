import { Command } from '../types/Command';

import { EmbedBuilder, time } from 'discord.js';
import Party from '../structures/Party';
import UserReputation from '../structures/UserReputation';

export const command: Command =
{
	info: {
		name: 'user',
	},
	parentOf: 'party',
	async execute( interaction, rawlocale )
	{
		const locale = rawlocale.commands[ `${this.parentOf}.${this.info.name}` ];

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

		// @ts-ignore
		const party = await Party.get( member.id );
		// @ts-ignore
		if ( party?.status === 0 )
		{
			// @ts-ignore
			return interaction.reply( { content: member.id === interaction.user.id ? locale.YouHasNoParty : locale.UserHasNoParty, ephemeral: true } );
		}
		// @ts-ignore
		const members = party.members.concat( [ party.owner ] );

		const reputations = await UserReputation.getMany( members );
		const reputationSum = reputations.reduce( ( acc, cur ) => acc + Number( cur.reputation ), 0 );


		// @ts-ignore
		let infoDescription = locale.embed.description.format( [ time( new Date( party.date ), 'R' ), party.meta.course, reputationSum ] );
		// @ts-ignore
		if ( party.meta.privacy.has( 'Owner' ) )
		{
			// @ts-ignore
			infoDescription += locale.embed.owner.format( [ `<@${party.owner}>` ] );
		}
		// @ts-ignore
		if ( party.meta.privacy.has( 'Members' ) )
		{
			// @ts-ignore
			infoDescription += locale.embed.members.format( [ members.length, members.map( m => `[${reputations.find( rec => rec.id === m ).reputation}] <@${m}>` ).join( ', ' ) ] ) + '\n';
		}

		// @ts-ignore
		infoDescription += `\n${ party.meta.description.render() }`;
		const embed = new EmbedBuilder()
			// @ts-ignore
			.setTitle( locale.embed.title.format( [ party.name ] ) )
			.setDescription( infoDescription )
			// @ts-ignore
			.setThumbnail( party.meta.icon )
			.setColor( bot.config.colors.embedBorder )
			// @ts-ignore
			.setFooter( { text: `ID: ${party.id}` } );

		return await interaction.reply( { embeds: [embed] } );
	}
};