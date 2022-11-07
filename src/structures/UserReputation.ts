import { Snowflake } from 'discord.js';

type UserReputationT = {
	id: string,
	reputation?: number
}

class UserReputation
{
	public id: string;
	public reputation: number;

	constructor( data: UserReputationT )
	{
		this.id = data.id;
		this.reputation = data.reputation || 0;
	}

	static async get( id: Snowflake ): Promise<UserReputation>
	{
		// @ts-ignore
		const db: UserReputationT = await bot.db.collection( 'reputation' ).findOne( { id } );
		if ( !db ) return new UserReputation( { id } );
		else return new UserReputation( db );
	}

	static async getMany( ids: Snowflake[] ): Promise<UserReputation[]>
	{
		const db = ( await ( await bot.db.collection( 'reputation' ).find() ).toArray() ).filter( rec => ids.includes( rec.id ) );
		return ids.map( ( id ) =>
		{
			// @ts-ignore
			const req: UserReputationT | null = db.find( rec => rec.id === id );
			return req ? new UserReputation( req ) : new UserReputation( { id } );
		} );
	}

	add( count = 1 )
	{
		this.reputation += count;
	}

	remove( count = 1 )
	{
		this.reputation -= count;
	}

	async save()
	{
		return await bot.db.collection( 'reputation' ).updateOne( { id: this.id }, { $set: this.toJSON() }, { upsert: true } );
	}

	toJSON()
	{
		return {
			id: this.id,
			reputation: this.reputation
		};
	}
}

export default UserReputation;