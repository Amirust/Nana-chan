const PartyMeta = require('./PartyMeta');

class Party 
{
	constructor(data)
	{
		this.id = data.id;
		this.name = data.name;
		this.members = data.members || []; // Array<Snowflake>
		this.owner = data.owner;
		this.meta = new PartyMeta(data.meta);
	}

	static async isPartyMember( id )
	{
		return !!( await bot.db.collection('parties').findOne({ $or: [ { owner: id }, { members: { $regex: id } } ] }) );
	}

	static async isNameOccupied( name )
	{
		return !!( await bot.db.collection('parties').findOne({ name }) );
	}

	static create( owner, name )
	{
		const id = (Date.now() % 1000000).toString(16);
		return new Party({ id, owner, name, date: Date.now() });
	}

	static async get( id )
	{
		if ( /^[0-9]{17,19}$/gm.test(id) )
		{
			return new Party( await bot.db.collection('parties').findOn({ $or: [ { owner: id }, { members: { $regex: id } } ] }) );
		}
		return await new Party( await bot.db.collection('parties').findOne({ id }) );
	}

	async save()
	{
		return await bot.db.collection('parties').updateOne({ id: this.id }, { $set: this.toJSON() }, { upsert: true });
	}

	async delete()
	{
		return await bot.db.collection('parties').deleteOne({ id: this.id });
	}

	async addMember( id )
	{
		if ( this.members.includes(id) ) return false;
		this.members.push(id);
		return await this.save();
	}

	async removeMember( id )
	{
		if ( !this.members.includes(id) ) return false;
		this.members.splice(this.members.indexOf(id), 1);
		return await this.save();
	}

	async addMembers( ids )
	{
		this.members = this.members.concat(ids);
		return await this.save();
	}

	async removeMembers( ids )
	{
		this.members = this.members.filter(member => !ids.includes(member));
		return await this.save();
	}

	toJSON()
	{
		return {
			id: this.id,
			name: this.name,
			members: this.members,
			owner: this.owner,
			meta: this.meta.toJSON()
		};
	}
}

module.exports = Party;