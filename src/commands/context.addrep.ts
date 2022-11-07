import { ContextCommand } from '../types/ContextCommand';

import { time } from 'discord.js';
import UserReputation from '../structures/UserReputation';

export const command: ContextCommand =
{
	info: {
		name: 'Повысить репутацию',
		type: 2
	},
	async execute( interaction, rawLocale )
	{
		const locale = rawLocale.commands['context.addrep'];

		if ( interaction.user.id === interaction.targetId )
		{
			return interaction.reply( { content: locale.CantSetRepToSelf, ephemeral: true } );
		}

		// @ts-ignore
		if ( !interaction.member?.roles.cache.has( '925061751563776016' ) ) 
		{
			return interaction.reply( {content: locale.NoPermissions, ephemeral: true} );
		};
		
		if ( bot.cooldowns.reputation.has( interaction.user.id ) )
		{
			const cooldown = bot.cooldowns.reputation.get( interaction.user.id );
			// @ts-ignore
			if ( !( cooldown.createdAt + 1000 * 60 * 60 * 4 < Date.now() ) )
			{
				return interaction.reply( {
					// @ts-ignore
					content: locale.Cooldown.format( [ time( new Date( cooldown.createdAt + 1000 * 60 * 60 * 4 ), 'R' ) ] ),
					ephemeral: true
				} );
			}
			else { bot.cooldowns.reputation.delete( interaction.user.id ); }
		}

		const user = await bot.client.users.fetch( interaction.targetId );
		const reputation = await UserReputation.get( user.id );

		reputation.add();
		await reputation.save();

		bot.cooldowns.reputation.set( interaction.user.id, { createdAt: Date.now() } );
		return interaction.reply( { content: locale.Success.format( [ `<@${user.id}>`, reputation.reputation ] ) } );
	}
};