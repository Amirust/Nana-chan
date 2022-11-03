import { SelectMenuBuilder, SelectMenuInteraction } from 'discord.js';

SelectMenuBuilder.prototype.setAction = function ( cb: Function, collector: any )
{
	collector.on( 'collect', async ( i: SelectMenuInteraction ) =>
	{
		if ( i.customId === this.data.custom_id ) { await cb( i ); }
	} );

	return this;
};