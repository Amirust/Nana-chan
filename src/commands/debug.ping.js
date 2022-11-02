const { EmbedBuilder, codeBlock } = require( 'discord.js' );

module.exports =
{
	info: {
		name: 'ping',
		description: 'Выдает пинг бота'
	},
	async execute( interaction )
	{
		const time = Date.now();
		const text = `🔌 WEBSOCKET : ${bot.client.ws.ping}ms`;
		const embed = new EmbedBuilder()
			.setAuthor( { name: bot.client.user.tag, iconURL: bot.client.user.avatarURL( { size: 64 } ) } )
			.setColor( bot.config.colors.primary )
			.setFooter( bot.config.footer )
			.setDescription( codeBlock( text ) );

		await interaction.reply( { embeds: [embed] } );
		embed.setDescription( codeBlock( text + `\n✉️ MESSAGE   : ${Date.now() - time}ms` ) );

		const embed2 = new EmbedBuilder()
			.setAuthor( { name: 'Дополнительная информация' } )
			.setColor( bot.config.colors.primary )
			.setDescription( codeBlock( `⏰ UPTIME   : ${bot.client.uptime / 1000}ms\n🦦 MEM_USE  : ${ ( process.memoryUsage().heapUsed / 1024 / 1024 ).toFixed( 1 ) }Mb` ) );

		return interaction.editReply( { embeds: [embed, embed2] } );
	}
};