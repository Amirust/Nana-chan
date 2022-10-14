const { randomBytes } = require('crypto');

class Marriage {
	constructor(data)
	{
		this.id = data.id;
		this.initializer = data.initializer;
		this.target = data.target;
		this.date = new Date(data.date);
	}

	static async isInitializerMarried( id )
	{
		return !!( await bot.db.collection('marriages').findOne({ initializer: id }) );
	}

	static async isTargetMarried( id )
	{
		return !!( await bot.db.collection('marriages').findOne({ target: id }) );
	}

	static async create({ initializer, target })
	{
		let id = BigInt( `0x${crypto.createHmac( 'sha256', 'marry' ).update( ( BigInt( initializer ) + BigInt( target ) ).toString() ).digest( 'hex' )}` ) % (1024n * 16n);
		return new Marriage({ id: id.toString().padStart(5, '0'), initializer, target, date: Date.now() });
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
			initializer: this.initializer,
			target: this.target,
			date: this.date
		};
	}
}

module.exports = Marriage;