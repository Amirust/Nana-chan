const PartyMeta = require('./PartyMeta');

class Party 
{
	constructor(data)
	{
		this.id = data.id;
		this.name = data.name;
		this.members = data.members || []; // Array<Snowflake>
		this.owner = data.owner;
		this.status = data.status || 0; // 0 - Ожидает инициализации, 1 - Активна
		this.roleId = data.roleId || null;
		this.date = data.date;
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

	static async isOwner( id )
	{
		return !!( await bot.db.collection('parties').findOne({ owner: id }) );
	}

	static async create( owner, name )
	{
		const id = (Date.now() % 1000000).toString(16);
		const role = await bot.client.guilds.cache.get('925061751211450380').roles.create({
			name: name
		});
		return new Party({ id, owner, name, date: Date.now(), roleId: role.id });
	}

	static async get( id )
	{
		if ( /^[0-9]{17,19}$/gm.test(id) )
		{
			return new Party( await bot.db.collection('parties').findOne({ $or: [ { owner: id }, { members: { $regex: id } } ] }) );
		}
		return await new Party( await bot.db.collection('parties').findOne({ id }) );
	}

	async save()
	{
		return await bot.db.collection('parties').updateOne({ id: this.id }, { $set: this.toJSON() }, { upsert: true });
	}

	async delete()
	{
		await bot.client.guilds.cache.get('925061751211450380').roles.delete(this.roleId);
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
			status: this.status,
			roleId: this.roleId,
			date: this.date,
			meta: this.meta.toJSON()
		};
	}
}

module.exports = Party;