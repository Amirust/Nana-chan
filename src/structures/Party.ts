import PartyMeta from './PartyMeta';
import { Snowflake } from 'discord.js';
import UserReputation from './UserReputation';

type PartyT = {
	id: string,
	name: string,
	members?: Array<Snowflake> | null,
	owner: Snowflake,
	status?: number,
	roleId: Snowflake,
	date: Date,
	meta?: any
}

class Party
{
	public id: string;
	public name: string;
	public members: Array<Snowflake>;
	public owner: Snowflake;
	public status: number;
	public roleId: Snowflake;
	public date: Date;
	public meta: PartyMeta;

	constructor( data: PartyT )
	{
		this.id = data.id;
		this.name = data.name;
		this.members = data.members || []; // Array<Snowflake>
		this.owner = data.owner;
		this.status = data.status || 0; // 0 - Ожидает инициализации, 1 - Активна
		this.roleId = data.roleId;
		this.date = data.date;
		this.meta = new PartyMeta( data.meta );
	}

	static async isPartyMember( id: Snowflake )
	{
		return !!( await bot.db.collection( 'parties' ).findOne( { $or: [ { owner: id }, { members: { $regex: id } } ] } ) );
	}

	static async isNameOccupied( name: string )
	{
		return !!( await bot.db.collection( 'parties' ).findOne( { name } ) );
	}

	static async isOwner( id: Snowflake )
	{
		return !!( await bot.db.collection( 'parties' ).findOne( { owner: id } ) );
	}

	static async create( owner: Snowflake, name: string )
	{
		const id = ( Date.now() % 1000000 ).toString( 16 );
		// @ts-ignore
		const role = await bot.client.guilds.cache.get( '925061751211450380' ).roles.create( {
			name: name
		} );
		return new Party( { id, owner, name, date: new Date(), roleId: role.id } );
	}

	static async get( id: Snowflake | string )
	{
		if ( /^[0-9]{17,19}$/gm.test( id ) )
		{
			// @ts-ignore
			const party: PartyT = await bot.db.collection( 'parties' ).findOne( { $or: [ { owner: id }, { members: { $regex: id } } ] } );
			return party ? new Party( party ) : null;
		}
		// @ts-ignore
		const party: PartyT = await bot.db.collection( 'parties' ).findOne( { id } );
		return party ? new Party( party ) : null;
	}

	async save()
	{
		return await bot.db.collection( 'parties' ).updateOne( { id: this.id }, { $set: this.toJSON() }, { upsert: true } );
	}

	async delete()
	{
		// @ts-ignore
		await bot.client.guilds.cache.get( '925061751211450380' ).roles.delete( this.roleId );
		return await bot.db.collection( 'parties' ).deleteOne( { id: this.id } );
	}

	async addMember( id: Snowflake )
	{
		if ( this.members.includes( id ) ) return false;
		this.members.push( id );
		return await this.save();
	}

	async removeMember( id: Snowflake )
	{
		if ( !this.members.includes( id ) ) return false;
		this.members.splice( this.members.indexOf( id ), 1 );
		return await this.save();
	}

	async addMembers( ids: Array<Snowflake> )
	{
		this.members = this.members.concat( ids );
		return await this.save();
	}

	async removeMembers( ids: Array<Snowflake> )
	{
		this.members = this.members.filter( member => !ids.includes( member ) );
		return await this.save();
	}

	async getInfo()
	{
		const members = this.members.concat( this.owner );
		const reputations = await UserReputation.getMany( members );
		const reputationSum = reputations.reduce( ( acc, cur ) => acc + cur.reputation, 0 );

		const reputation2members = members
			.map( m => ( { rep: reputations.find( rec => rec.id === m )?.reputation || 0, id: m } ) )
			.sort( ( a, b ) => b.rep - a.rep );

		return {
			reputationSum,
			reputation2members
		};
	}

	toJSON()
	{
		return {
			id: this.id,
			name: this.name,
			members: this.members,
			owner: this.owner,
			status: this.status,
			roleId: this.roleId,
			date: this.date,
			meta: this.meta.toJSON()
		};
	}
}

export default Party;