const { EmbedBuilder, codeBlock } = require('discord.js');

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
            .setAuthor({ name: bot.client.user.tag, iconURL: bot.client.user.avatarURL({ size: 64 }) })
            .setColor( bot.config.colors.primary )
            .setFooter( bot.config.footer )
            .setDescription( codeBlock( text ) );

		await interaction.reply({ embeds: [embed] });
        embed.setDescription( codeBlock( text + `\n✉️ MESSAGE   : ${Date.now() - time}ms` ) )

		return interaction.editReply({ embeds: [embed] });
	}
};