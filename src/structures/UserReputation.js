class UserReputation
{
	constructor(data)
	{
		this.id = data.id;
		this.reputation = data.reputation || 0;
	}

	static async get( id )
	{
		const db = await bot.db.collection('reputation').findOne({ id });
		if (!db) return new UserReputation({ id });
		else return new UserReputation(db);
	}

	async add( count = 1 )
	{
		this.reputation += count;
	}

	async remove( count = 1 )
	{
		this.reputation -= count;
	}

	async save()
	{
		return await bot.db.collection('reputation').updateOne({ id: this.id }, { $set: this.toJSON() }, { upsert: true });
	}

	toJSON()
	{
		return {
			id: this.id,
			reputation: this.reputation
		};
	}
}

module.exports = UserReputation;