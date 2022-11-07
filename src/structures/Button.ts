
import { ButtonBuilder, ButtonInteraction } from 'discord.js';

ButtonBuilder.prototype.setAction = function ( cb: Function, collector  )
{
	collector.on( 'collect', async ( i: ButtonInteraction ) =>
	{
		// @ts-ignore
		if ( i.customId === this.data.custom_id && i.isRepliable() ) { await cb( i ); }
	} );

	return this;
};