class Flags 
{
	constructor(bitfield) 
	{
		this.bitfield = this.constructor.resolve(bitfield) ?? 0;
	}

	has(bit) 
	{
		if (Array.isArray(bit)) return bit.every(p => this.has(p));
		bit = this.constructor.resolve(bit);
		return (this.bitfield & bit) === bit;
	}

	add(...bits) 
	{
		for (const bit of bits) this.bitfield |= this.constructor.resolve(bit);
		return this;
	}

	remove(...bits) 
	{
		for (const bit of bits) this.bitfield &= ~this.constructor.resolve(bit);
		return this;
	}

	toArray() 
	{
		return Object.keys(this.constructor.FLAGS).filter(bit => this.has(bit));
	}

	static resolve(bit) 
	{
		if (typeof bit === 'undefined') return 0;
		if (typeof bit === 'number') return bit;
		if (typeof bit === 'string' && bit in this.FLAGS) return this.FLAGS[bit];
		else return 0;
	}
	
	static FLAGS = {};
}

module.exports = Flags;