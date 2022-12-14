import RenderableMD from './RenderableMD';
import Flags from './Flags';

class Privacy extends Flags 
{
	static FLAGS = {
		Owner: ( 1 << 0 ),
		Members: ( 2 << 0 )
	};
}

class PartyMeta 
{
	public _description: RenderableMD | null;
	public privacy: Privacy;
	public icon: string | null;
	public course: string | null;
	public _charter: RenderableMD | null;

	constructor( data: { description: string | null, privacy: number | null, icon: string | null, course: string | null, charter: string | null } )
	{
		this._description = data?.description ? new RenderableMD( { md: data.description } ) : null;
		this.privacy = new Privacy( data?.privacy || 3 );
		this.icon = data?.icon || null;
		this.course = data?.course || null;
		this._charter = data?.charter ? new RenderableMD( { md: data.charter } ) : null;
	}

	get description()
	{
		// @ts-ignore
		return this._description;
	}

	set description( value: string )
	{
		// @ts-ignore
		this._description = new RenderableMD( { md: value } );
	}

	get charter()
	{
		// @ts-ignore
		return this._charter;
	}

	set charter( value: string )
	{
		// @ts-ignore
		this._charter = new RenderableMD( { md: value } );
	}

	toJSON()
	{
		return {
			description: this._description ? this._description.toJSON() : null,
			privacy: this.privacy.bitfield,
			icon: this.icon,
			course: this.course,
			charter: this._charter ? this._charter.toJSON() : null
		};
	}
}

export default PartyMeta;