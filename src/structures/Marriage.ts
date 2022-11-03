import { Snowflake } from 'discord.js';
import crypto from 'crypto';

type MarriageT = {
	id: string,
	initializer: Snowflake,
	target: Snowflake,
	date: Date
}

class Marriage 
{
	public id: string;
	public initializer: Snowflake;
	public target: Snowflake;
	public date: Date;

	constructor( data: { id: string, initializer: Snowflake, target: Snowflake, date: Date } )
	{
		this.id = data.id;
		this.initializer = data.initializer;
		this.target = data.target;
		this.date = new Date( data.date );
	}

	static async isMarried( id: Snowflake )
	{
		return !!( await bot.db.collection( 'marriages' ).findOne( { $or: [ { initializer: id }, { target: id } ] } ) );
	}

	static create( { initializer, target }: { initializer: Snowflake, target: Snowflake } )
	{
		let id = BigInt( `0x${crypto.createHmac( 'sha256', 'marry' ).update( ( BigInt( initializer ) + BigInt( target ) ).toString() ).digest( 'hex' )}` ) % ( 1024n * 16n );
		return new Marriage( { id: id.toString().padStart( 5, '0' ), initializer, target, date: new Date() } );
	}

	static async get( id: Snowflake | string )
	{
		if ( /^[0-9]{17,19}$/gm.test( id ) )
		{
			// @ts-ignore
			const marriage: MarriageT | null = await bot.db.collection( 'marriages' ).findOne( { $or: [ { initializer: id }, { target: id } ] } );
			return marriage ? new Marriage( marriage ) : null;
		}
		// @ts-ignore
		const marriage: MarriageT | null = await bot.db.collection( 'marriages' ).findOne( { id } );
		return marriage ? new Marriage( marriage ) : null;
	}

	async save()
	{
		return await bot.db.collection( 'marriages' ).updateOne( { id: this.id }, { $set: this.toJSON() }, { upsert: true } );
	}

	async delete()
	{
		return await bot.db.collection( 'marriages' ).deleteOne( { id: this.id } );
	}

	toJSON()
	{
		return {
			id: this.id,
			initializer: this.initializer,
			target: this.target,
			date: this.date
		};
	}
}

export default Marriage;