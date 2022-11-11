import {Client, Collection, IntentsBitField, Partials} from 'discord.js';
import { Db, MongoClient } from 'mongodb';
import fs from 'fs';
import InteractionController from '../controllers/interaction.controller';

require( '../structures/Button' ); // Модификация прототипа Button
require( '../structures/SelectMenu' ); // Модификация прототипа SelectMenu
require( '../structures/Modal' ); // Модификация прототипа Modal

import { BotStore, BotConfig, RequestsCooldown } from '../types/Client';
import { Command } from '../types/Command';

const intents = new IntentsBitField();
Object.keys( IntentsBitField.Flags ).map( ( intent: any ) =>
{
	return intents.add( intent );
} );

class Bot
{
	public client: Client;
	public config;
	public store!: BotStore;
	public cooldowns: { [name: string]: Collection<string, RequestsCooldown> };
	public readonly InteractionController: InteractionController;
	public readonly IC: InteractionController;

	protected mongo!: MongoClient;

	private readonly commands: Collection<string, Command>;
	private readonly token!: string;
	private readonly _mongo!: string;

	constructor( { token, mongo, config }: { token: string, mongo: string, config: BotConfig } )
	{
		this.client = new Client( {
			intents,
			presence: {
				status: 'idle',
				activities: [{
					name: 'за суперпозицией',
					type: 3
				}]
			},
			partials: [ Partials.User, Partials.Channel, Partials.Reaction ]
		} );

		this.config = config;
		this.cooldowns = {};

		Object.defineProperties( this, {
			token: { value: token },
			_mongo: { value: mongo }
		} );

		fs.readdirSync( './dist/events' ).filter( ( file ) => file.endsWith( '.js' ) ).forEach( ( file ) =>
		{
			const event = require( `../events/${file}` );
			const name = file.split( '.' )[ 0 ];

			try { this.client.on( name, event ); }
			catch ( e ) { console.error( e ); }
		} );

		this.commands = new Collection();
		fs.readdirSync( './dist/commands' ).filter( ( f ) => f.endsWith( '.js' ) ).forEach( ( file ) =>
		{
			const interaction = require( `../commands/${file}` ).command;
			if ( !interaction ) return;
			this.commands.set( interaction.parentOf ? `${interaction.parentOf}.${interaction.info.name}` : interaction.info.name, interaction );
		} );

		this.InteractionController = new InteractionController( this.commands );
		this.IC = this.InteractionController; // Алиас

		this.client.on( 'interactionCreate', async ( interaction: any ) =>
		{
			await this.InteractionController.process( interaction, interaction.locale );
		} );
	}

	async init(): Promise<Bot>
	{
		console.log( 'Инициализация клиента...' );
		await this.client.login( this.token );

		if ( this._mongo )
		{
			// @ts-ignore
			this.mongo = await MongoClient.connect( this._mongo, { useUnifiedTopology: true } );
			console.log( 'База данных подключена' );
		}

		this.store = {
			activeMarriesRequests: new Collection(),
			activeDivorcesRequests: new Collection(),
			activePartyInvites: new Collection()
		};

		this.cooldowns.reputation = new Collection();

		return this;
	}

	get db(): Db
	{
		return this.mongo.db( 'Nana' );
	}
}

export default Bot;
