const { Client, IntentsBitField, Collection } = require('discord.js');
const { MongoClient } = require( 'mongodb' );
const fs = require( 'fs' );
const InteractionController = require('../controllers/interaction.controller');

require('../structures/Button'); // Модификация прототипа Button
require('../structures/SelectMenu'); // Модификация прототипа SelectMenu

const intents = new IntentsBitField();
Object.keys( IntentsBitField.Flags ).map( ( intent ) =>
{
	return intents.add( intent );
});

class Bot
{
	constructor({ token, mongo, config })
	{
		this.client = new Client({
			intents,
			presence: {
				status: 'idle',
				activities: [{
					name: 'за суперпозицией',
					type: 3
				}]
			},
			partials: [ 'USER', 'CHANNEL', 'REACTION' ]
		});

		this.config = config;
		this.store = {};

		Object.defineProperties( this, {
			token: { value: token },
			_mongo: { value: mongo }
		});

		fs.readdirSync( './src/events' ).filter( ( file ) => file.endsWith( '.js' ) ).forEach( ( file ) =>
		{
			const event = require( `../events/${file}` );
			const name = file.split( '.' )[ 0 ];

			try { this.client.on( name, event ); }
			catch ( e ) { console.error( e ); }
		});

		this.commands = new Collection();
		fs.readdirSync( './src/commands' ).filter( ( f ) => f.endsWith( '.js' ) ).forEach( ( file ) =>
		{
			const interaction = require( `../commands/${file}` );
			this.commands.set( interaction.info.name, interaction );
		});

		this.InteractionController = new InteractionController( this.commands );
		this.IC = this.InteractionController; // Алиас

		this.client.on( 'interactionCreate', async ( interaction ) =>
		{
			await this.InteractionController.process( interaction );
		});
	}

	async init()
	{
		console.log( 'Инициализация клиента...' );
		await this.client.login( this.token );

		if ( this._mongo )
		{
			this.mongo = await MongoClient.connect( this._mongo, { useUnifiedTopology: true });
			console.log( 'База данных подключена' );
		}

		this.store.activeMarriesRequests = new Collection;
		this.store.activeDivorcesRequests = new Collection;

		return this;
	}

	get db()
	{
		return this.mongo.db('Nana');
	}
}

module.exports = Bot;
