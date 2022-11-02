
const { ButtonBuilder } = require( 'discord.js' );

ButtonBuilder.prototype.setAction = function ( cb, collector )
{
	collector.on( 'collect', async ( i ) =>
	{
		if ( i.customId === this.data.custom_id && i.isRepliable() ) { await cb( i ); }
	} );

	return this;
};