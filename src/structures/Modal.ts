
import { ModalBuilder } from 'discord.js';

ModalBuilder.prototype.setAction = function ( cb: Function )
{
	bot.client.on( 'interactionCreate', async interaction => 
	{
		if ( !interaction.isModalSubmit() ) return;
		if ( interaction.customId === this.data.custom_id ) { await cb( interaction ); }
	} );

	return this;
};