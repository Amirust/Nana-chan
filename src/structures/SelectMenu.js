const { SelectMenuBuilder } = require( 'discord.js' );

SelectMenuBuilder.prototype.setAction = function ( cb, collector )
{
	collector.on( 'collect', async ( i ) =>
	{
		if ( i.customId === this.data.custom_id ) { await cb( i ); }
	});

	return this;
};