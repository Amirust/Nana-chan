import { Message } from 'discord.js';
import { inspect } from 'util';

module.exports = async ( message: Message ) =>
{
	if ( !bot.config.owners.includes( message.author.id ) ) { return; }

	let trigger = '?eval';
	// @ts-ignore
	if ( bot.client.user.id === bot.config.alphaId ) { trigger = ':eval'; }

	if ( !message.content.startsWith( trigger ) ) { return; }

	const arg = message.content.slice( 5 ).trim();
	try
	{
		const evaled = await eval( arg );

		// @ts-ignore
		if ( [ 'READ_MESSAGE_HISTORY', 'ADD_REACTIONS' ].every( async ( perm ) => message.channel.permissionsFor( await message.guild.members.fetch( bot.client.id ) )?.has( perm ) ) )
		{
			message.react( '✅' );
		}

		if ( evaled === undefined )
		{
			return;
		}
		const text = inspect( evaled, { depth: 0, maxArrayLength: 50 } );
		if ( text.length > 1990 )
		{
			return 'Ответ занимает больше чем позволенно дискордом';
		}
		await message.channel.send( '```js\n' + text + '```' ).catch( () => {} );
	}
	catch ( error )
	{
		// @ts-ignore
		if ( [ 'READ_MESSAGE_HISTORY', 'ADD_REACTIONS' ].every( async ( perm ) => message.channel.permissionsFor( await message.guild.members.fetch( bot.client.id ) )?.has( perm ) ) )
		{
			message.react( '❌' );
		}
		await message.channel.send( '```js\n' + error + '```' ).catch( () => {} );
	}
};