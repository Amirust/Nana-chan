class Flags 
{
	public bitfield: number;

	constructor( bitfield: number )
	{
		// @ts-ignore
		this.bitfield = this.constructor.resolve( bitfield ) ?? 0;
	}

	has( bit: number | string ): boolean
	{
		if ( Array.isArray( bit ) ) return bit.every( p => this.has( p ) );
		// @ts-ignore
		const resolved = this.constructor.resolve( bit );
		return ( this.bitfield & resolved ) === bit;
	}

	add( ...bits: Array<number> ): Flags
	{
		// @ts-ignore
		for ( const bit of bits ) this.bitfield |= this.constructor.resolve( bit );
		return this;
	}

	remove( ...bits: Array<number> ): Flags
	{
		// @ts-ignore
		for ( const bit of bits ) this.bitfield &= ~this.constructor.resolve( bit );
		return this;
	}

	toArray() 
	{
		// @ts-ignore
		return Object.keys( this.constructor.FLAGS ).filter( bit => this.has( bit ) );
	}

	static resolve( bit: number | string ): number | null
	{
		if ( typeof bit === 'undefined' ) return 0;
		if ( typeof bit === 'number' ) return bit;
		// @ts-ignore
		if ( typeof bit === 'string' && bit in this.FLAGS ) return this.FLAGS[bit];
		else return 0;
	}
	
	static FLAGS = {};
}

export default Flags;