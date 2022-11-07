const { time } = require( 'discord.js' );
const UserReputation = require( '../structures/UserReputation' );

module.exports =
{
	info: {
		name: 'Понизить репутацию',
		description: '',
		type: 2
	},
	async execute( interaction, locale )
	{
		locale = locale.commands['context.remrep'];

		if ( interaction.user.id === interaction.targetId )
		{
			return interaction.reply({ content: locale.CantSetRepToSelf, ephemeral: true });
		}

		if ( !interaction.member.roles.cache.has( '925061751563776016' ) )
		{
			return interaction.reply({ content: locale.NoPermissions, ephemeral: true });
		}

		if ( bot.cooldowns.reputation.has( interaction.user.id ) )
		{
			const cooldown = bot.cooldowns.reputation.get( interaction.user.id );
			if ( !( cooldown.createdAt + 1000 * 60 * 60 * 4 < Date.now() ) )
			{
				return interaction.reply({
					content: locale.Cooldown.format( [ time( new Date( cooldown.createdAt + 1000 * 60 * 60 * 4 ), 'R' ) ] ),
					ephemeral: true
				});
			}
			else { bot.cooldowns.reputation.delete( interaction.user.id ); }
		}

		const user = await bot.client.users.fetch( interaction.targetId );
		const reputation = await UserReputation.get( user.id );

		reputation.remove();
		await reputation.save();

		bot.cooldowns.reputation.set( interaction.user.id, { createdAt: Date.now() });
		return interaction.reply({ content: locale.Success.format( [ `<@${interaction.user.id}>`,  `<@${user.id}>`, reputation.reputation ] ), allowedMentions: [user.id]});
	}
};