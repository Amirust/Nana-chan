const cp = require( 'child_process' );

module.exports = async ( message ) =>
{
	if ( !bot.config.owners.includes( message.author.id ) ) { return; }

	let trigger = '?sh';
	if ( bot.client.user.id === bot.config.alphaId ) { trigger = ':sh'; }

	if ( !message.content.startsWith( trigger ) ) { return; }
	const cmd = message.content.slice( 3 ).trim();
	const reply = ( text, msg = message ) => msg.reply( { content: '```sh\n' + text + '```',  allowedMentions: { repliedUser: false } } ).catch( () => {} );
	try
	{
		const exec = command => new Promise( ( resolve, reject ) => cp.exec( command, ( err, stdout, stderr ) => ( err || stderr ) && reject( err || stderr ) || resolve( stdout ) ) );
		let collector;

		if ( cmd === 'enter' )
		{
			collector = message.channel.createMessageCollector( { filter: ( m ) => m.author.id === message.author.id, idle: 30000 } );
			await message.reply( { files: ['https://cdn.discordapp.com/attachments/1028379601921114136/1037416274495553546/54gem_stone.png'] } );
			collector.on( 'collect', ( m ) => 
			{
				const command = m.content;

				if ( command === 'exet' )
				{
					return collector ? collector.stop() : message.reply( 'Нахер иди, коллектора нету' );
				}

				return exec( command ).catch( e => reply( e, m ) ).then( r => reply( r, m ) );
			} );
			collector.on( 'end', () => 
			{
				message.channel.send( `${message.author.toString()} коллектор заглох` );
				collector = null;
			} );
		}

		else if ( !['enter', 'exet'].includes( cmd ) ) 
		{
			const text = await exec( cmd );
			if ( text.length > 1990 )
			{
				return reply( 'Ответ занимает больше чем дискорд готов сожрать' );
			}
			await reply( text ).catch( () => {} );
		}
	}
	catch ( error )
	{
		await reply( error ).catch( () => {} );
	}
};