
const { ModalBuilder } = require( 'discord.js' );

ModalBuilder.prototype.setAction = function ( cb )
{
	bot.client.on( 'interactionCreate', async interaction => 
	{
		if ( !interaction.isModalSubmit() ) return;
		if ( interaction.customId === this.data.custom_id ) { await cb( interaction ); }
	});

	return this;
};