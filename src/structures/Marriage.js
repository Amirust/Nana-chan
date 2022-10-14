const { randomBytes } = require('crypto');

class Marriage {
	constructor(data)
	{
		this.id = data.id;
		this.initiazer = data.initiazer;
		this.target = data.target;
		this.date = new Date(data.date);
	}

	static async isInitializerMarried( id )
	{
		return !!( await bot.db.collection('marriages').findOne({ initiazer: id }) );
	}

	static async isTargetMarried( id )
	{
		return !!( await bot.db.collection('marriages').findOne({ target: id }) );
	}

	static create({ initiazer, target })
	{
		return new Marriage({ id: randomBytes(4).toString('hex'), initiazer, target, date: Date.now() });
	}

	async save()
	{
		return await bot.db.collection('marriages').updateOne({ id: this.id }, { $set: this.toJSON() }, { upsert: true });
	}

	async delete()
	{
		return await bot.db.collection('marriages').deleteOne({ id: this.id });
	}

	toJSON()
	{
		return {
			id: this.id,
			initiazer: this.initiazer,
			target: this.target,
			date: this.date
		};
	}
}

module.exports = Marriage;