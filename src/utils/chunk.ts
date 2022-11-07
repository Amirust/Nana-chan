export default ( str: Array<any>, size: number ) =>
{
	return Array.from( { length: Math.ceil( str.length / size ) }, ( _, n ) => str.slice( n * size, n * size + size ) );
};